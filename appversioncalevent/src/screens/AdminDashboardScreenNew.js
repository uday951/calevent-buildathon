import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

export const AdminDashboardScreen = ({ navigation }) => {
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [requestStats, setRequestStats] = useState({
    totalRequests: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchData = async () => {
    try {
      const [dashRes, reqStatsRes, reqListRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/event-requests/admin/stats'),
        api.get('/event-requests/admin/all', { params: { limit: 5 } }),
      ]);

      console.log('Dashboard Stats:', dashRes.data.data);
      console.log('Revenue:', dashRes.data.data.revenue);
      
      setDashboardStats(dashRes.data.data);
      setRequestStats(reqStatsRes.data.data);
      setRecentRequests(reqListRes.data.data.requests);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout(), style: 'destructive' },
    ]);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const menuCards = [
    { id: 'requests', title: 'Event Requests', icon: '📋', color: '#7c3aed', count: requestStats.pending, screen: 'AdminEventRequests' },
    { id: 'bookings', title: 'Bookings', icon: '📦', color: '#3b82f6', count: dashboardStats?.bookings?.pending || 0, screen: 'AdminBookings' },
    { id: 'providers', title: 'Providers', icon: '🏢', color: '#f59e0b', count: dashboardStats?.providers?.pending || 0, screen: 'AdminProviders' },
    { id: 'users', title: 'Users', icon: '👥', color: '#10b981', count: dashboardStats?.customers || 0, screen: 'AdminUsers' },
    { id: 'analytics', title: 'Analytics', icon: '📊', color: '#8b5cf6', screen: 'AdminAnalytics' },
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>CALEVENT Management</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#7c3aed' }]}>
            <Text style={styles.statNumber}>{dashboardStats?.bookings?.total || 0}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
            <Text style={styles.statNumber}>{dashboardStats?.providers?.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending Providers</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
            <Text style={styles.statNumber}>₹{((dashboardStats?.revenue || 0) / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Monthly Revenue</Text>
          </View>
        </View>

        {/* Menu Cards */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Admin Functions</Text>
          <View style={styles.menuGrid}>
            {menuCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.menuCard, { borderLeftColor: card.color }]}
                onPress={() => navigation.navigate(card.screen, { onRefresh: fetchData })}
              >
                <View style={styles.menuCardHeader}>
                  <Text style={styles.menuCardIcon}>{card.icon}</Text>
                  {card.count > 0 && (
                    <View style={[styles.menuCardBadge, { backgroundColor: card.color }]}>
                      <Text style={styles.menuCardBadgeText}>{card.count}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.menuCardTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Event Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminEventRequests')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No recent requests</Text>
            </View>
          ) : (
            recentRequests.map((request) => (
              <View key={request._id} style={styles.recentCard}>
                <View style={styles.recentCardHeader}>
                  <Text style={styles.recentCardTitle} numberOfLines={1}>
                    {request.eventTitle || request.eventType}
                  </Text>
                  <View style={[styles.recentStatusBadge, { backgroundColor: request.status === 'pending' ? '#f59e0b' : '#10b981' }]}>
                    <Text style={styles.recentStatusText}>{request.status}</Text>
                  </View>
                </View>
                <Text style={styles.recentCardInfo}>👤 {request.customerId?.name}</Text>
                <Text style={styles.recentCardInfo}>📅 {formatDate(request.eventDate)}</Text>
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
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#dc2626' },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  menuContainer: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuCardIcon: { fontSize: 32 },
  menuCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  menuCardBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  menuCardTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  recentContainer: { paddingHorizontal: 16 },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#7c3aed' },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  recentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentCardTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1 },
  recentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recentStatusText: { fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },
  recentCardInfo: { fontSize: 12, color: '#64748b', marginBottom: 3 },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#64748b', fontWeight: '600' },
});
