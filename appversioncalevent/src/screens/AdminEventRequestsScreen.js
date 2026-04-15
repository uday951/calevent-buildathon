import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

export const AdminEventRequestsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [filter, setFilter] = useState('all');

  const fetchRequests = useCallback(async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/event-requests/admin/all${params}`);
      setRequests(res.data.data.requests);
      setStatusCounts(res.data.data.statusCounts || {});
    } catch (error) {
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (requestId, newStatus) => {
    try {
      await api.patch(`/event-requests/admin/${requestId}/status`, { status: newStatus });
      Alert.alert('Success', `Status updated to ${newStatus}`);
      fetchRequests();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
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
      pending: '#f59e0b',
      contacted: '#3b82f6',
      providers_assigned: '#8b5cf6',
      quoted: '#06b6d4',
      approved: '#10b981',
      in_progress: '#6366f1',
      completed: '#059669',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'in_progress', label: 'Active' },
    { key: 'completed', label: 'Done' },
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
        <Text style={styles.headerTitle}>Event Requests</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} colors={['#7c3aed']} />}
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

        <View style={styles.requestsContainer}>
          {requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No requests found</Text>
            </View>
          ) : (
            requests.map((request) => (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.requestTitle} numberOfLines={1}>
                      {request.eventTitle || request.eventType}
                    </Text>
                    <Text style={styles.requestType}>{request.eventType}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Text style={styles.statusText}>{request.status.replace('_', ' ')}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>👤 Customer:</Text>
                  <Text style={styles.infoValue}>{request.customerId?.name || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📞 Phone:</Text>
                  <Text style={styles.infoValue}>{request.customerId?.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📅 Event Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(request.eventDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>👥 Guests:</Text>
                  <Text style={styles.infoValue}>{request.guestCount}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📍 Venue:</Text>
                  <Text style={styles.infoValue}>{request.venue}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>💰 Budget:</Text>
                  <Text style={styles.infoValue}>
                    ₹{request.budget?.min?.toLocaleString('en-IN')} - ₹{request.budget?.max?.toLocaleString('en-IN')}
                  </Text>
                </View>

                {request.specialRequests && (
                  <View style={styles.specialRequests}>
                    <Text style={styles.infoLabel}>💬 Special Requests:</Text>
                    <Text style={styles.specialRequestsText}>{request.specialRequests}</Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  {request.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                        onPress={() => updateStatus(request._id, 'contacted')}
                      >
                        <Text style={styles.actionBtnText}>✓ Contact</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                        onPress={() => updateStatus(request._id, 'cancelled')}
                      >
                        <Text style={styles.actionBtnText}>✕ Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {request.status === 'contacted' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
                      onPress={() => updateStatus(request._id, 'providers_assigned')}
                    >
                      <Text style={styles.actionBtnText}>👥 Assign Provider</Text>
                    </TouchableOpacity>
                  )}
                  {request.status === 'providers_assigned' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#06b6d4' }]}
                      onPress={() => updateStatus(request._id, 'quoted')}
                    >
                      <Text style={styles.actionBtnText}>💵 Send Quote</Text>
                    </TouchableOpacity>
                  )}
                  {request.status === 'approved' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#6366f1' }]}
                      onPress={() => updateStatus(request._id, 'in_progress')}
                    >
                      <Text style={styles.actionBtnText}>🚀 Start Event</Text>
                    </TouchableOpacity>
                  )}
                  {request.status === 'in_progress' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                      onPress={() => updateStatus(request._id, 'completed')}
                    >
                      <Text style={styles.actionBtnText}>✓ Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.timestamp}>Created: {formatDate(request.createdAt)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  requestsContainer: { paddingHorizontal: 16 },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  requestTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  requestType: { fontSize: 12, color: '#7c3aed', fontWeight: '600', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#64748b', width: 120, fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#0f172a', flex: 1, fontWeight: '500' },
  specialRequests: { marginTop: 8, marginBottom: 12 },
  specialRequestsText: { fontSize: 13, color: '#0f172a', marginTop: 4, fontStyle: 'italic' },
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
});
