import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

export const AdminUsersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [userType, setUserType] = useState('customers');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get(`/admin/users?type=${userType}`);
      setUsers(res.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userType]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'suspend' : 'activate';
    const message = action === 'suspend' 
      ? 'Are you sure you want to suspend this user?' 
      : 'Are you sure you want to activate this user?';

    Alert.alert(
      'Confirm Action',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'suspend' ? 'Suspend' : 'Activate',
          style: action === 'suspend' ? 'destructive' : 'default',
          onPress: async () => {
            let reason = '';
            if (action === 'suspend') {
              Alert.prompt(
                'Suspension Reason',
                'Please provide a reason:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Suspend',
                    onPress: async (text) => {
                      reason = text || 'Suspended by admin';
                      await performToggle(userId, action, reason);
                    },
                  },
                ],
                'plain-text'
              );
            } else {
              await performToggle(userId, action, reason);
            }
          },
        },
      ]
    );
  };

  const performToggle = async (userId, action, reason) => {
    try {
      const type = userType === 'providers' ? 'provider' : 'customer';
      await api.patch(`/admin/users/${userId}/${type}/toggle-status`, { action, reason });
      Alert.alert('Success', `User ${action}d successfully`);
      fetchUsers();
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
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} colors={['#7c3aed']} />}
      >
        {/* Type Toggle */}
        <View style={styles.typeToggleContainer}>
          <TouchableOpacity
            style={[styles.typeToggleBtn, userType === 'customers' && styles.typeToggleBtnActive]}
            onPress={() => setUserType('customers')}
          >
            <Text style={[styles.typeToggleText, userType === 'customers' && styles.typeToggleTextActive]}>
              👥 Customers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeToggleBtn, userType === 'providers' && styles.typeToggleBtnActive]}
            onPress={() => setUserType('providers')}
          >
            <Text style={[styles.typeToggleText, userType === 'providers' && styles.typeToggleTextActive]}>
              🏢 Providers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Users List */}
        <View style={styles.usersContainer}>
          <Text style={styles.sectionTitle}>
            {userType === 'customers' ? 'All Customers' : 'All Providers'} ({users.length})
          </Text>

          {users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : (
            users.map((user) => (
              <View key={user._id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{user.name || user.businessName}</Text>
                      {user.isActive ? (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      ) : (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>Suspended</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userPhone}>📞 {user.phone}</Text>
                    
                    {userType === 'providers' && user.categories && (
                      <View style={styles.categoriesContainer}>
                        {user.categories.slice(0, 3).map((cat, idx) => (
                          <View key={idx} style={styles.categoryChip}>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📅 Joined:</Text>
                  <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
                </View>

                {userType === 'providers' && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>✓ Verified:</Text>
                      <Text style={styles.infoValue}>{user.isVerified ? 'Yes' : 'No'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>📍 Location:</Text>
                      <Text style={styles.infoValue}>{user.location?.city || 'N/A'}</Text>
                    </View>
                  </>
                )}

                {!user.isActive && user.suspensionReason && (
                  <View style={styles.suspensionInfo}>
                    <Text style={styles.suspensionLabel}>🚫 Suspension Reason:</Text>
                    <Text style={styles.suspensionText}>{user.suspensionReason}</Text>
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: user.isActive ? '#ef4444' : '#10b981' },
                  ]}
                  onPress={() => handleToggleStatus(user._id, user.isActive)}
                >
                  <Text style={styles.actionBtnText}>
                    {user.isActive ? '🚫 Suspend User' : '✓ Activate User'}
                  </Text>
                </TouchableOpacity>
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
  typeToggleContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeToggleBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  typeToggleText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  typeToggleTextActive: { color: '#fff' },
  usersContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  userCard: {
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
  userHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  userName: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1 },
  activeBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeBadgeText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  inactiveBadgeText: { fontSize: 10, fontWeight: '700', color: '#dc2626' },
  userEmail: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  userPhone: { fontSize: 12, color: '#64748b' },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: { fontSize: 10, fontWeight: '600', color: '#7c3aed' },
  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { fontSize: 13, color: '#64748b', width: 100, fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#0f172a', flex: 1, fontWeight: '500' },
  suspensionInfo: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: 8,
  },
  suspensionLabel: { fontSize: 12, color: '#dc2626', fontWeight: '600', marginBottom: 4 },
  suspensionText: { fontSize: 12, color: '#0f172a', fontStyle: 'italic' },
  actionBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#64748b', fontWeight: '600' },
});
