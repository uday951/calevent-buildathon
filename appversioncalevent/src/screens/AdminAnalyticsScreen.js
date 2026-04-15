import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const { width } = Dimensions.get('window');

export const AdminAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('30');
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/admin/analytics?period=${period}`);
      setAnalytics(res.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const periodButtons = [
    { key: '7', label: '7 Days' },
    { key: '30', label: '30 Days' },
    { key: '90', label: '90 Days' },
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
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAnalytics();
            }}
            colors={['#7c3aed']}
          />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {periodButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              style={[styles.periodBtn, period === btn.key && styles.periodBtnActive]}
              onPress={() => setPeriod(btn.key)}
            >
              <Text style={[styles.periodBtnText, period === btn.key && styles.periodBtnTextActive]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Revenue Overview</Text>
          <View style={styles.revenueCard}>
            <Text style={styles.revenueAmount}>
              ₹{((analytics?.revenue?.total || 0) / 1000).toFixed(1)}K
            </Text>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <View style={styles.revenueStats}>
              <View style={styles.revenueStat}>
                <Text style={styles.revenueStatValue}>{analytics?.revenue?.count || 0}</Text>
                <Text style={styles.revenueStatLabel}>Completed Bookings</Text>
              </View>
              <View style={styles.revenueStat}>
                <Text style={styles.revenueStatValue}>
                  ₹{((analytics?.revenue?.total || 0) / (analytics?.revenue?.count || 1) / 1000).toFixed(1)}K
                </Text>
                <Text style={styles.revenueStatLabel}>Avg. Booking Value</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Bookings by Category</Text>
          {analytics?.categoryStats?.length > 0 ? (
            <View style={styles.categoryStatsContainer}>
              {analytics.categoryStats.map((cat, idx) => {
                const total = analytics.categoryStats.reduce((sum, c) => sum + c.count, 0);
                const percentage = ((cat.count / total) * 100).toFixed(1);
                return (
                  <View key={idx} style={styles.categoryStatCard}>
                    <View style={styles.categoryStatHeader}>
                      <Text style={styles.categoryStatName}>{cat._id || 'Other'}</Text>
                      <Text style={styles.categoryStatCount}>{cat.count}</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.categoryStatPercentage}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No category data available</Text>
            </View>
          )}
        </View>

        {/* Booking Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Booking Trends</Text>
          {analytics?.bookingTrends?.length > 0 ? (
            <View style={styles.trendsContainer}>
              {analytics.bookingTrends.slice(-7).map((trend, idx) => {
                const maxCount = Math.max(...analytics.bookingTrends.map((t) => t.count));
                const barHeight = (trend.count / maxCount) * 120;
                return (
                  <View key={idx} style={styles.trendBar}>
                    <View style={styles.trendBarContainer}>
                      <View style={[styles.trendBarFill, { height: barHeight }]}>
                        <Text style={styles.trendBarValue}>{trend.count}</Text>
                      </View>
                    </View>
                    <Text style={styles.trendBarLabel}>
                      {new Date(trend._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No trend data available</Text>
            </View>
          )}
        </View>

        {/* Daily Revenue Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💵 Revenue Trends</Text>
          {analytics?.bookingTrends?.length > 0 ? (
            <View style={styles.revenueListContainer}>
              {analytics.bookingTrends.slice(-10).reverse().map((trend, idx) => (
                <View key={idx} style={styles.revenueListItem}>
                  <View style={styles.revenueListDate}>
                    <Text style={styles.revenueListDateText}>
                      {new Date(trend._id).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.revenueListStats}>
                    <Text style={styles.revenueListAmount}>
                      ₹{((trend.revenue || 0) / 1000).toFixed(1)}K
                    </Text>
                    <Text style={styles.revenueListCount}>{trend.count} bookings</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No revenue data available</Text>
            </View>
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
  periodContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  periodBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  periodBtnTextActive: { color: '#fff' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  revenueCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  revenueAmount: { fontSize: 48, fontWeight: '900', color: '#fff', marginBottom: 4 },
  revenueLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20 },
  revenueStats: { flexDirection: 'row', gap: 32 },
  revenueStat: { alignItems: 'center' },
  revenueStatValue: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  revenueStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  categoryStatsContainer: { gap: 12 },
  categoryStatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryStatName: { fontSize: 14, fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' },
  categoryStatCount: { fontSize: 16, fontWeight: '800', color: '#7c3aed' },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 4 },
  categoryStatPercentage: { fontSize: 12, color: '#64748b', textAlign: 'right' },
  trendsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendBar: { flex: 1, alignItems: 'center' },
  trendBarContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  trendBarFill: {
    width: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    minHeight: 20,
  },
  trendBarValue: { fontSize: 10, fontWeight: '700', color: '#fff' },
  trendBarLabel: { fontSize: 9, color: '#64748b', textAlign: 'center' },
  revenueListContainer: { gap: 8 },
  revenueListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueListDate: { flex: 1 },
  revenueListDateText: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  revenueListStats: { alignItems: 'flex-end' },
  revenueListAmount: { fontSize: 16, fontWeight: '800', color: '#10b981', marginBottom: 2 },
  revenueListCount: { fontSize: 11, color: '#64748b' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: { fontSize: 14, color: '#94a3b8' },
});
