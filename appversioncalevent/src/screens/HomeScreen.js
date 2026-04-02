import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '../components/EventCard';
import { EventCardCompact } from '../components/EventCardCompact';
import api from '../services/api';

const { width } = Dimensions.get('window');

const FALLBACK_EVENTS = [
  { _id: '1', title: 'Royal Wedding Package',       category: 'Wedding',   price: 250000, rating: 4.9, providerId: { businessName: 'Dream Weddings Co.' },    eventImage: 'https://images.unsplash.com/photo-1767986012154-db9a321c8832?w=400&q=80' },
  { _id: '2', title: 'Corporate Annual Gala',        category: 'Corporate', price: 180000, rating: 4.8, providerId: { businessName: 'Elite Events Ltd.' },      eventImage: 'https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?w=400&q=80' },
  { _id: '3', title: 'Birthday Celebration Deluxe',  category: 'Birthday',  price: 45000,  rating: 4.7, providerId: { businessName: 'Party Paradise' },         eventImage: 'https://images.unsplash.com/photo-1583852542295-05d29d3cff55?w=400&q=80' },
  { _id: '4', title: 'Live Concert Experience',      category: 'Concert',   price: 95000,  rating: 4.9, providerId: { businessName: 'SoundWave Productions' },  eventImage: 'https://images.unsplash.com/photo-1631061434620-db65394197e2?w=400&q=80' },
  { _id: '5', title: 'Garden Party Setup',           category: 'Party',     price: 35000,  rating: 4.6, providerId: { businessName: 'Garden Events Hub' },      eventImage: 'https://images.unsplash.com/photo-1698602807831-81066d89ed41?w=400&q=80' },
];

const categoryCircles = [
  { name: 'Weddings',  image: 'https://images.unsplash.com/photo-1760669336713-17e4d2cf4e39?w=200&q=80',  filter: 'wedding' },
  { name: 'Corporate', image: 'https://images.unsplash.com/photo-1633457896836-f8d6025c85d1?w=200&q=80',  filter: 'corporate' },
  { name: 'Birthdays', image: 'https://images.unsplash.com/photo-1583852542295-05d29d3cff55?w=200&q=80',  filter: 'birthday' },
  { name: 'Concerts',  image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=200&q=80',  filter: 'concert' },
  { name: 'Parties',   image: 'https://images.unsplash.com/photo-1698602807831-81066d89ed41?w=200&q=80',  filter: 'party' },
  { name: 'Catering',  image: 'https://images.unsplash.com/photo-1774025967891-b4ed833e57ac?w=200&q=80',  filter: 'catering' },
];

const banners = [
  { label: 'Mega Sale', title: 'Wedding Season\nPackages', sub: 'Flat 50% Off on Top Venues', btn: 'BOOK NOW', overlay: 'rgba(0,0,0,0.55)', image: 'https://images.unsplash.com/photo-1767986012154-db9a321c8832?w=800&q=80', category: 'wedding' },
  { label: 'Corporate Special', title: 'End-of-Year\nRetreats', sub: 'All-inclusive from ₹1.5L', btn: 'EXPLORE', overlay: 'rgba(124,58,237,0.7)', image: 'https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?w=800&q=80', category: 'corporate' },
];

export const HomeScreen = ({ navigation }) => {
  const [search, setSearch]       = useState('');
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get('/events', { params: { limit: 20 } });
      const data = res.data?.data?.events || res.data?.events || [];
      setEvents(data.length > 0 ? data : FALLBACK_EVENTS);
    } catch {
      setEvents(FALLBACK_EVENTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const onRefresh = () => { setRefreshing(true); fetchEvents(); };

  const goToExplore = (category) => navigation.navigate('Explore', { category });
  const goToDetail  = (event)    => navigation.navigate('EventDetail', { event });

  const filtered = events.filter(e =>
    (e.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const getImageUri = (event) => {
    if (!event.eventImage) return 'https://picsum.photos/400/300?random=1';
    if (event.eventImage.startsWith('http')) return event.eventImage;
    return `${api.defaults.baseURL?.replace('/api', '')}/${event.eventImage}`;
  };

  const enriched = filtered.map(e => ({ ...e, eventImage: getImageUri(e) }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>CALEVENT</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}><Text style={styles.icon}>🔔</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.icon}>❤️</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}><Text style={styles.icon}>🛍️</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
      >
        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, venues, planners..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => navigation.navigate('Explore', { searchQuery: search })}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94a3b8', fontSize: 18, paddingHorizontal: 8 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Circles */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.circlesRow}>
            {categoryCircles.map((cat, i) => (
              <TouchableOpacity key={i} style={styles.circleItem} activeOpacity={0.8} onPress={() => goToExplore(cat.filter)}>
                <View style={styles.circleWrap}>
                  <Image source={{ uri: cat.image }} style={styles.circleImg} />
                </View>
                <Text style={styles.circleName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hero Banners */}
        <View style={styles.bannerSection}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {banners.map((b, i) => (
              <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => goToExplore(b.category)}>
                <View style={styles.bannerCard}>
                  <Image source={{ uri: b.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  <View style={[styles.bannerOverlay, { backgroundColor: b.overlay }]}>
                    <Text style={styles.bannerLabel}>{b.label}</Text>
                    <Text style={styles.bannerTitle}>{b.title}</Text>
                    <Text style={styles.bannerSub}>{b.sub}</Text>
                    <View style={styles.bannerBtn}>
                      <Text style={styles.bannerBtnText}>{b.btn}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Crazy Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CRAZY DEALS</Text>
          </View>
          <View style={styles.dealsGrid}>
            <TouchableOpacity style={styles.dealCard} activeOpacity={0.85} onPress={() => goToExplore('concert')}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1631061434620-db65394197e2?w=400&q=80' }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={styles.dealOverlay}>
                <Text style={styles.dealName}>Live Concerts</Text>
                <Text style={styles.dealOffer}>Min 40% Off</Text>
              </View>
              <View style={styles.dealRating}><Text style={styles.dealRatingText}>⭐ 4.9</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dealCard} activeOpacity={0.85} onPress={() => goToExplore('catering')}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1774025967891-b4ed833e57ac?w=400&q=80' }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={[styles.dealOverlay, { backgroundColor: 'rgba(124,58,237,0.8)' }]}>
                <Text style={styles.dealName}>Premium Catering</Text>
                <Text style={[styles.dealOffer, { color: '#fff' }]}>Under ₹1000/px</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRENDING EVENTS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.seeAll}>See All ›</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color="#7c3aed" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
              {enriched.slice(0, 4).map(event => (
                <EventCard key={event._id} event={event} onPress={() => goToDetail(event)} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Discover More */}
        <View style={[styles.section, { paddingHorizontal: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DISCOVER MORE</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#7c3aed" style={{ marginVertical: 20 }} />
          ) : enriched.slice(4).length > 0 ? (
            enriched.slice(4).map(event => (
              <EventCardCompact key={event._id} event={event} onPress={() => goToDetail(event)} />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>{search ? 'No events match your search' : 'No more events'}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#fff' },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerLogo:     { fontSize: 20, fontWeight: '800', color: '#7c3aed', letterSpacing: -0.5 },
  headerIcons:    { flexDirection: 'row', gap: 16 },
  icon:           { fontSize: 20 },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', marginHorizontal: 16, marginVertical: 10, borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e2e8f0' },
  searchIcon:     { fontSize: 16, marginRight: 8 },
  searchInput:    { flex: 1, fontSize: 14, color: '#0f172a' },
  section:        { backgroundColor: '#fff', paddingVertical: 16, marginBottom: 8 },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle:   { fontSize: 15, fontWeight: '800', color: '#0f172a', letterSpacing: 0.5 },
  seeAll:         { fontSize: 13, fontWeight: '600', color: '#7c3aed' },
  circlesRow:     { paddingHorizontal: 16, gap: 16 },
  circleItem:     { alignItems: 'center', gap: 6 },
  circleWrap:     { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(124,58,237,0.2)' },
  circleImg:      { width: '100%', height: '100%' },
  circleName:     { fontSize: 11, fontWeight: '600', color: '#0f172a', textAlign: 'center' },
  bannerSection:  { marginHorizontal: 16, marginBottom: 8 },
  bannerCard:     { width: width - 32, height: 180, borderRadius: 14, overflow: 'hidden' },
  bannerOverlay:  { flex: 1, padding: 18, justifyContent: 'center' },
  bannerLabel:    { fontSize: 10, fontWeight: '800', color: '#facc15', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  bannerTitle:    { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 28, marginBottom: 4, maxWidth: '65%' },
  bannerSub:      { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 14, maxWidth: '65%' },
  bannerBtn:      { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  bannerBtnText:  { fontSize: 12, fontWeight: '800', color: '#7c3aed' },
  dealsGrid:      { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  dealCard:       { flex: 1, height: 150, borderRadius: 12, overflow: 'hidden' },
  dealOverlay:    { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10 },
  dealName:       { color: '#fff', fontWeight: '700', fontSize: 13 },
  dealOffer:      { color: '#facc15', fontWeight: '800', fontSize: 15 },
  dealRating:     { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  dealRatingText: { fontSize: 11, fontWeight: '700' },
  empty:          { alignItems: 'center', paddingVertical: 32 },
  emptyIcon:      { fontSize: 40, marginBottom: 8 },
  emptyText:      { fontSize: 15, fontWeight: '600', color: '#64748b' },
});
