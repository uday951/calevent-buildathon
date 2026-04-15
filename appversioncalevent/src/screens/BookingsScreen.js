import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, TextInput, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../components/ui/Badge';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const TABS = [
  { id: 'all',       label: 'All' },
  { id: 'confirmed', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const MOCK = [
  { _id: 'b1', eventTitle: 'Royal Wedding Package',      eventDate: '2026-05-15', eventTime: '10:00 AM', status: 'confirmed', totalAmount: 250000, guests: 200, venue: 'Grand Ballroom', eventImage: 'https://picsum.photos/400/300?random=10', providerId: { businessName: 'Dream Weddings Co.' } },
  { _id: 'b2', eventTitle: 'Corporate Annual Gala',       eventDate: '2026-05-22', eventTime: '6:00 PM',  status: 'pending',   totalAmount: 180000, guests: 150, venue: 'Convention Center', eventImage: 'https://picsum.photos/400/300?random=11', providerId: { businessName: 'Elite Events Ltd.' } },
  { _id: 'b3', eventTitle: 'Birthday Celebration Deluxe', eventDate: '2026-06-08', eventTime: '4:00 PM',  status: 'confirmed', totalAmount: 45000,  guests: 50,  venue: 'Party Hall',       eventImage: 'https://picsum.photos/400/300?random=12', providerId: { businessName: 'Party Paradise' } },
  { _id: 'b4', eventTitle: 'Garden Party Setup',          eventDate: '2026-03-12', eventTime: '3:00 PM',  status: 'completed', totalAmount: 35000,  guests: 80,  venue: 'Garden Venue',     eventImage: 'https://picsum.photos/400/300?random=13', providerId: { businessName: 'Garden Events Hub' } },
  { _id: 'b5', eventTitle: 'Team Building Event',         eventDate: '2026-02-05', eventTime: '9:00 AM',  status: 'cancelled', totalAmount: 60000,  guests: 100, venue: 'Office Grounds',   eventImage: 'https://picsum.photos/400/300?random=14', providerId: { businessName: 'Corporate Solutions' } },
];

const statusVariant = s => ({ confirmed: 'success', completed: 'success', pending: 'warning', cancelled: 'error' }[s] || 'default');
const statusLabel   = s => ({ confirmed: 'Confirmed', completed: 'Completed', pending: 'Pending', cancelled: 'Cancelled' }[s] || s);

export const BookingsScreen = ({ navigation }) => {
  const [tab,        setTab]        = useState('all');
  const [search,     setSearch]     = useState('');
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) { setBookings(MOCK); setIsLoggedIn(false); setLoading(false); setRefreshing(false); return; }
      setIsLoggedIn(true);
      const res  = await api.get('/event-requests/my');
      const data = res.data?.data?.requests || [];
      // Map event-request fields to booking card fields
      const mapped = data.map(r => ({
        _id: r._id,
        eventTitle: r.eventTitle || `${r.eventType} Event`,
        eventDate: r.eventDate,
        eventTime: r.eventTime,
        status: r.status === 'approved' ? 'confirmed' : r.status === 'providers_assigned' ? 'confirmed' : r.status,
        totalAmount: r.quotation?.totalAmount || r.budget?.max || 0,
        guests: r.guestCount,
        venue: r.location?.city,
        eventImage: 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 20),
        providerId: r.assignments?.[0]?.providerId ? { businessName: r.assignments[0].providerId.businessName || r.assignments[0].providerId.name } : null,
        requestNumber: r.requestNumber,
      }));
      setBookings(mapped.length > 0 ? mapped : MOCK);
    } catch {
      setBookings(MOCK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const handleCancel = (bookingId) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        try {
          await api.patch(`/bookings/${bookingId}/cancel`);
          fetchBookings();
        } catch {
          Alert.alert('Error', 'Could not cancel booking. Please try again.');
        }
      }},
    ]);
  };

  const filtered = bookings.filter(b => {
    const matchTab    = tab === 'all' || b.status === tab;
    const matchSearch = (b.eventTitle || '').toLowerCase().includes(search.toLowerCase()) ||
                        (b.providerId?.businessName || '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabCounts = TABS.map(t => ({
    ...t,
    count: t.id === 'all' ? bookings.length : bookings.filter(b => b.status === t.id).length,
  }));

  const renderItem = ({ item: b }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('EventDetail', { bookingId: b._id })}>
      <Image source={{ uri: b.eventImage || 'https://picsum.photos/400/300?random=1' }} style={styles.cardImg} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{b.eventTitle}</Text>
          <Badge variant={statusVariant(b.status)}>{statusLabel(b.status)}</Badge>
        </View>
        <Text style={styles.provider} numberOfLines={1}>{b.providerId?.businessName || 'Provider'}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>📅 {b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</Text>
          <Text style={styles.infoText}>🕐 {b.eventTime || 'TBD'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>📍 {b.venue || 'Venue TBD'}</Text>
          <Text style={styles.infoText}>👥 {b.guests || 0} guests</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.amount}>₹{(b.totalAmount || 0).toLocaleString('en-IN')}</Text>
          <View style={styles.actions}>
            {b.status === 'pending' && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(b._id)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
            {b.status === 'completed' && (
              <TouchableOpacity style={styles.reviewBtn}>
                <Text style={styles.reviewBtnText}>⭐ Review</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>Track your event reservations</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search bookings..." placeholderTextColor="#94a3b8" value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={{ color: '#94a3b8', fontSize: 16, paddingHorizontal: 6 }}>✕</Text></TouchableOpacity>}
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        {tabCounts.map(t => (
          <TouchableOpacity key={t.id} style={[styles.tab, tab === t.id && styles.tabActive]} onPress={() => setTab(t.id)} activeOpacity={0.8}>
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
            <View style={[styles.tabBadge, tab === t.id && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, tab === t.id && styles.tabBadgeTextActive]}>{t.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {!isLoggedIn && (
        <View style={styles.loginBanner}>
          <Text style={styles.loginBannerText}>⚠️ Showing demo data. Login to see your real bookings.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.loginBannerLink}>Login →</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No bookings found</Text>
              <Text style={styles.emptySub}>{tab === 'all' ? "You haven't made any bookings yet." : `No ${tab} bookings found.`}</Text>
              <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Explore')}>
                <Text style={styles.browseBtnText}>Browse Events</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#f8fafc' },
  headerBg:           { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle:        { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerSub:          { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  searchWrap:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e2e8f0' },
  searchIcon:         { fontSize: 15, marginRight: 8 },
  searchInput:        { flex: 1, fontSize: 14, color: '#0f172a' },
  tabsWrap:           { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  tab:                { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0' },
  tabActive:          { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  tabText:            { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive:      { color: '#fff' },
  tabBadge:           { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1 },
  tabBadgeActive:     { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabBadgeText:       { fontSize: 10, fontWeight: '700', color: '#64748b' },
  tabBadgeTextActive: { color: '#fff' },
  loginBanner:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef9c3', marginHorizontal: 16, marginTop: 10, padding: 10, borderRadius: 10 },
  loginBannerText:    { fontSize: 12, color: '#a16207', flex: 1 },
  loginBannerLink:    { fontSize: 12, fontWeight: '700', color: '#7c3aed', marginLeft: 8 },
  list:               { padding: 16, paddingBottom: 24 },
  card:               { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardImg:            { width: '100%', height: 150 },
  cardBody:           { padding: 14 },
  cardTop:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle:          { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  provider:           { fontSize: 13, color: '#64748b', marginBottom: 8 },
  infoRow:            { flexDirection: 'row', gap: 16, marginBottom: 4 },
  infoText:           { fontSize: 12, color: '#64748b', fontWeight: '500' },
  cardFooter:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  amount:             { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  actions:            { flexDirection: 'row', gap: 8 },
  cancelBtn:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: '#ef4444' },
  cancelBtnText:      { fontSize: 12, fontWeight: '700', color: '#ef4444' },
  reviewBtn:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fef9c3' },
  reviewBtnText:      { fontSize: 12, fontWeight: '700', color: '#a16207' },
  empty:              { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:          { fontSize: 52, marginBottom: 12 },
  emptyTitle:         { fontSize: 17, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  emptySub:           { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 32, marginBottom: 20 },
  browseBtn:          { backgroundColor: '#7c3aed', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  browseBtnText:      { color: '#fff', fontWeight: '700', fontSize: 14 },
});
