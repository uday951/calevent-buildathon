import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

export const AdminBookingsScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [filter, setFilter] = useState('all');
  const [assignModal, setAssignModal] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const params = filter !== 'all' ? `?adminStatus=${filter}` : '';
      const res = await api.get(`/admin/bookings${params}`);
      setBookings(res.data.data.bookings);
      setStatusCounts(res.data.data.statusCounts || {});
    } catch (error) {
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const fetchProvidersForBooking = async (bookingId) => {
    try {
      const res = await api.get(`/admin/bookings/${bookingId}`);
      setProviders(res.data.data.availableProviders || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load providers');
    }
  };

  const handleAssignProvider = async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a provider');
      return;
    }

    try {
      await api.patch(`/admin/bookings/${assignModal._id}/assign-provider`, {
        providerId: selectedProvider,
      });
      Alert.alert('Success', 'Provider assigned successfully');
      setAssignModal(null);
      setSelectedProvider('');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign provider');
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, booking) => {
    if (newStatus === 'completed') {
      const amount = booking.pricing?.totalAmount || 0;
      Alert.alert(
        'Complete Event',
        `Mark this event as completed?\n\nRevenue: ₹${amount.toLocaleString('en-IN')} will be added to income.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete Event',
            style: 'default',
            onPress: async () => {
              try {
                await api.patch(`/admin/bookings/${bookingId}/status`, { adminStatus: newStatus });
                
                // Refresh dashboard stats
                if (route.params?.onRefresh) {
                  route.params.onRefresh();
                }
                
                Alert.alert(
                  'Success',
                  `Event completed!\n₹${amount.toLocaleString('en-IN')} added to revenue.`,
                  [{ text: 'OK', onPress: () => fetchBookings() }]
                );
              } catch (error) {
                Alert.alert('Error', error.response?.data?.message || 'Failed to complete event');
              }
            },
          },
        ]
      );
    } else {
      try {
        await api.patch(`/admin/bookings/${bookingId}/status`, { adminStatus: newStatus });
        Alert.alert('Success', `Status updated to ${newStatus}`);
        fetchBookings();
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_review: '#f59e0b',
      provider_assigned: '#8b5cf6',
      confirmed: '#10b981',
      in_progress: '#3b82f6',
      completed: '#059669',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'pending_review', label: 'Pending' },
    { key: 'provider_assigned', label: 'Assigned' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Management</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} colors={['#7c3aed']} />}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              style={[styles.filterBtn, filter === btn.key && styles.filterBtnActive]}
              onPress={() => setFilter(btn.key)}
            >
              <Text style={[styles.filterBtnText, filter === btn.key && styles.filterBtnTextActive]}>
                {btn.label}
              </Text>
              {btn.key !== 'all' && statusCounts[btn.key] > 0 && (
                <View style={[styles.filterBadge, filter === btn.key && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, filter === btn.key && styles.filterBadgeTextActive]}>
                    {statusCounts[btn.key]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bookingsContainer}>
          {bookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          ) : (
            bookings.map((booking) => (
              <View key={booking._id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingTitle}>{booking.eventId?.title || 'Event'}</Text>
                    <Text style={styles.bookingCategory}>{booking.eventType}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.adminStatus) }]}>
                    <Text style={styles.statusText}>{booking.adminStatus?.replace('_', ' ')}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>👤 Customer:</Text>
                  <Text style={styles.infoValue}>{booking.customerId?.name || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📞 Phone:</Text>
                  <Text style={styles.infoValue}>{booking.customerId?.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📅 Event Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(booking.eventDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>👥 Guests:</Text>
                  <Text style={styles.infoValue}>{booking.guestCount || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>💰 Amount:</Text>
                  <Text style={styles.infoValue}>₹{booking.pricing?.totalAmount?.toLocaleString('en-IN') || 'N/A'}</Text>
                </View>

                {booking.assignedProvider && (
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerLabel}>🏢 Assigned Provider:</Text>
                    <Text style={styles.providerName}>{booking.assignedProvider?.businessName || booking.assignedProvider?.name}</Text>
                  </View>
                )}

                {/* Tracking Timeline */}
                {booking.adminStatus !== 'pending_review' && booking.adminStatus !== 'cancelled' && (
                  <View style={styles.trackingContainer}>
                    <Text style={styles.trackingTitle}>📍 Event Tracking</Text>
                    <View style={styles.trackingSteps}>
                      <View style={styles.trackingStep}>
                        <View style={[styles.trackingDot, booking.adminStatus !== 'pending_review' && styles.trackingDotActive]} />
                        <Text style={[styles.trackingLabel, booking.adminStatus !== 'pending_review' && styles.trackingLabelActive]}>Assigned</Text>
                      </View>
                      <View style={[styles.trackingLine, booking.adminStatus === 'confirmed' || booking.adminStatus === 'in_progress' || booking.adminStatus === 'completed' ? styles.trackingLineActive : null]} />
                      <View style={styles.trackingStep}>
                        <View style={[styles.trackingDot, (booking.adminStatus === 'confirmed' || booking.adminStatus === 'in_progress' || booking.adminStatus === 'completed') && styles.trackingDotActive]} />
                        <Text style={[styles.trackingLabel, (booking.adminStatus === 'confirmed' || booking.adminStatus === 'in_progress' || booking.adminStatus === 'completed') && styles.trackingLabelActive]}>Confirmed</Text>
                      </View>
                      <View style={[styles.trackingLine, booking.adminStatus === 'in_progress' || booking.adminStatus === 'completed' ? styles.trackingLineActive : null]} />
                      <View style={styles.trackingStep}>
                        <View style={[styles.trackingDot, (booking.adminStatus === 'in_progress' || booking.adminStatus === 'completed') && styles.trackingDotActive]} />
                        <Text style={[styles.trackingLabel, (booking.adminStatus === 'in_progress' || booking.adminStatus === 'completed') && styles.trackingLabelActive]}>In Progress</Text>
                      </View>
                      <View style={[styles.trackingLine, booking.adminStatus === 'completed' ? styles.trackingLineActive : null]} />
                      <View style={styles.trackingStep}>
                        <View style={[styles.trackingDot, booking.adminStatus === 'completed' && styles.trackingDotActive]} />
                        <Text style={[styles.trackingLabel, booking.adminStatus === 'completed' && styles.trackingLabelActive]}>Completed</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Revenue Info for Completed */}
                {booking.adminStatus === 'completed' && (
                  <View style={styles.revenueInfo}>
                    <Text style={styles.revenueIcon}>💰</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.revenueLabel}>Revenue Added</Text>
                      <Text style={styles.revenueAmount}>₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</Text>
                    </View>
                    <Text style={styles.revenueDate}>{booking.completedAt ? formatDate(booking.completedAt) : 'Recently'}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {booking.adminStatus === 'pending_review' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
                        onPress={() => {
                          setAssignModal(booking);
                          fetchProvidersForBooking(booking._id);
                        }}
                      >
                        <Text style={styles.actionBtnText}>👥 Assign</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                        onPress={() => handleStatusUpdate(booking._id, 'cancelled', booking)}
                      >
                        <Text style={styles.actionBtnText}>✕ Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {booking.adminStatus === 'provider_assigned' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                      onPress={() => handleStatusUpdate(booking._id, 'confirmed', booking)}
                    >
                      <Text style={styles.actionBtnText}>✓ Confirm</Text>
                    </TouchableOpacity>
                  )}

                  {booking.adminStatus === 'confirmed' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                      onPress={() => handleStatusUpdate(booking._id, 'in_progress', booking)}
                    >
                      <Text style={styles.actionBtnText}>🚀 Start</Text>
                    </TouchableOpacity>
                  )}

                  {booking.adminStatus === 'in_progress' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#059669' }]}
                      onPress={() => handleStatusUpdate(booking._id, 'completed', booking)}
                    >
                      <Text style={styles.actionBtnText}>✓ Complete Event</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.timestamp}>Booked: {formatDate(booking.createdAt)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Assign Provider Modal */}
      <Modal visible={!!assignModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Provider</Text>

            {assignModal && (
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoText}>Event: {assignModal.eventId?.title}</Text>
                <Text style={styles.modalInfoText}>Customer: {assignModal.customerId?.name}</Text>
                <Text style={styles.modalInfoText}>Date: {formatDate(assignModal.eventDate)}</Text>
              </View>
            )}

            <Text style={styles.pickerLabel}>Select Provider ({providers.length} available)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedProvider}
                onValueChange={(value) => setSelectedProvider(value)}
                style={styles.picker}
              >
                <Picker.Item label="-- Choose a provider --" value="" />
                {providers.map((p) => (
                  <Picker.Item
                    key={p._id}
                    label={`${p.businessName || p.name} - ${p.location?.city || 'N/A'}`}
                    value={p._id}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleAssignProvider}
              >
                <Text style={styles.modalBtnText}>Assign</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSecondary]}
                onPress={() => {
                  setAssignModal(null);
                  setSelectedProvider('');
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#64748b' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: { fontSize: 16, fontWeight: '600', color: '#7c3aed' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  filterContainer: { paddingHorizontal: 16, gap: 10, marginVertical: 16 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  filterBtnText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  filterBtnTextActive: { color: '#fff' },
  filterBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  filterBadgeText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  filterBadgeTextActive: { color: '#fff' },
  bookingsContainer: { paddingHorizontal: 16 },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  bookingTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  bookingCategory: { fontSize: 12, color: '#7c3aed', fontWeight: '600', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#64748b', width: 120, fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#0f172a', flex: 1, fontWeight: '500' },
  providerInfo: { marginTop: 8, padding: 10, backgroundColor: '#f0fdf4', borderRadius: 8 },
  providerLabel: { fontSize: 12, color: '#059669', fontWeight: '600', marginBottom: 4 },
  providerName: { fontSize: 14, color: '#0f172a', fontWeight: '700' },
  trackingContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  trackingTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  trackingSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackingStep: { alignItems: 'center', flex: 1 },
  trackingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    marginBottom: 6,
  },
  trackingDotActive: { backgroundColor: '#7c3aed' },
  trackingLabel: { fontSize: 9, color: '#94a3b8', textAlign: 'center', fontWeight: '600' },
  trackingLabelActive: { color: '#7c3aed' },
  trackingLine: {
    height: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: -8,
  },
  trackingLineActive: { backgroundColor: '#7c3aed' },
  revenueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  revenueIcon: { fontSize: 24, marginRight: 12 },
  revenueLabel: { fontSize: 11, color: '#059669', fontWeight: '600', marginBottom: 2 },
  revenueAmount: { fontSize: 18, fontWeight: '800', color: '#047857' },
  revenueDate: { fontSize: 10, color: '#6ee7b7', fontWeight: '600' },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  timestamp: { fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#64748b', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  modalInfo: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalInfoText: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  pickerLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 8 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: { height: 50 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnPrimary: { backgroundColor: '#7c3aed' },
  modalBtnSecondary: { backgroundColor: '#f1f5f9' },
  modalBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
