import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

export const AdminProvidersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [providers, setProviders] = useState([]);
  const [filter, setFilter] = useState('pending');

  const fetchProviders = useCallback(async () => {
    try {
      const res = await api.get(`/admin/providers?status=${filter}`);
      setProviders(res.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load providers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleVerify = async (providerId, status) => {
    let reason = '';
    if (status === 'rejected') {
      Alert.prompt(
        'Rejection Reason',
        'Please provide a reason for rejection:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            onPress: async (text) => {
              reason = text || 'Application rejected by admin';
              await performVerification(providerId, status, reason);
            },
          },
        ],
        'plain-text'
      );
    } else {
      await performVerification(providerId, status, reason);
    }
  };

  const performVerification = async (providerId, status, reason) => {
    try {
      await api.patch(`/admin/providers/${providerId}/verify`, { status, reason });
      Alert.alert('Success', `Provider ${status} successfully`);
      fetchProviders();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Action failed');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filterButtons = [
    { key: 'pending', label: 'Pending', color: '#f59e0b' },
    { key: 'approved', label: 'Approved', color: '#10b981' },
    { key: 'rejected', label: 'Rejected', color: '#ef4444' },
    { key: 'all', label: 'All', color: '#6366f1' },
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
        <Text style={styles.headerTitle}>Provider Management</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProviders(); }} colors={['#7c3aed']} />}
      >
        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              style={[
                styles.filterBtn,
                filter === btn.key && { backgroundColor: btn.color, borderColor: btn.color },
              ]}
              onPress={() => setFilter(btn.key)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  filter === btn.key && styles.filterBtnTextActive,
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Providers List */}
        <View style={styles.providersContainer}>
          {providers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={styles.emptyText}>No providers found</Text>
            </View>
          ) : (
            providers.map((provider) => (
              <View key={provider._id} style={styles.providerCard}>
                <View style={styles.providerHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.providerName}>{provider.businessName}</Text>
                    <Text style={styles.providerEmail}>{provider.email}</Text>
                    <Text style={styles.providerPhone}>📞 {provider.phone}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          provider.verificationStatus === 'approved'
                            ? '#10b981'
                            : provider.verificationStatus === 'rejected'
                            ? '#ef4444'
                            : '#f59e0b',
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>{provider.verificationStatus}</Text>
                  </View>
                </View>

                {/* Categories */}
                <View style={styles.categoriesContainer}>
                  {provider.categories?.map((cat, idx) => (
                    <View key={idx} style={styles.categoryChip}>
                      <Text style={styles.categoryText}>{cat}</Text>
                    </View>
                  ))}
                </View>

                {/* Location & Date */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📍 Location:</Text>
                  <Text style={styles.infoValue}>{provider.location?.city || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📅 Applied:</Text>
                  <Text style={styles.infoValue}>{formatDate(provider.createdAt)}</Text>
                </View>

                {/* Action Buttons */}
                {provider.verificationStatus === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                      onPress={() => handleVerify(provider._id, 'approved')}
                    >
                      <Text style={styles.actionBtnText}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                      onPress={() => handleVerify(provider._id, 'rejected')}
                    >
                      <Text style={styles.actionBtnText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {provider.verificationStatus === 'approved' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#ef4444', marginTop: 12 }]}
                    onPress={() => handleVerify(provider._id, 'rejected')}
                  >
                    <Text style={styles.actionBtnText}>🚫 Suspend</Text>
                  </TouchableOpacity>
                )}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  filterBtnText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  filterBtnTextActive: { color: '#fff' },
  providersContainer: { paddingHorizontal: 16 },
  providerCard: {
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
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  providerName: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  providerEmail: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  providerPhone: { fontSize: 12, color: '#64748b' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#7c3aed' },
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { fontSize: 13, color: '#64748b', width: 100, fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#0f172a', flex: 1, fontWeight: '500' },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#64748b', fontWeight: '600' },
});
