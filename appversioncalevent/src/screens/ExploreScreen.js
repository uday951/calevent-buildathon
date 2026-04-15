import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput,
  ScrollView, StyleSheet, ActivityIndicator, RefreshControl,
  Dimensions, Image, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { getImageUri } from '../utils/normalize';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'all',           name: 'All',           emoji: '✨', gradient: ['#7c3aed', '#a855f7'] },
  { id: 'wedding',       name: 'Wedding',        emoji: '💒', gradient: ['#be185d', '#f43f5e'] },
  { id: 'corporate',     name: 'Corporate',      emoji: '🏢', gradient: ['#1d4ed8', '#3b82f6'] },
  { id: 'birthday',      name: 'Birthday',       emoji: '🎂', gradient: ['#b45309', '#f59e0b'] },
  { id: 'concert',       name: 'Concert',        emoji: '🎵', gradient: ['#7c3aed', '#c026d3'] },
  { id: 'party',         name: 'Party',          emoji: '🎉', gradient: ['#047857', '#10b981'] },
  { id: 'photography',   name: 'Photography',    emoji: '📸', gradient: ['#0c4a6e', '#0284c7'] },
  { id: 'catering',      name: 'Catering',       emoji: '🍽️', gradient: ['#b91c1c', '#ef4444'] },
  { id: 'entertainment', name: 'Entertainment',  emoji: '🎭', gradient: ['#3730a3', '#6366f1'] },
];

const catBg   = { all: '#f3e8ff', wedding: '#fce7f3', corporate: '#dbeafe', birthday: '#fef9c3', concert: '#f3e8ff', party: '#dcfce7', photography: '#cffafe', catering: '#fee2e2', entertainment: '#e0e7ff' };
const catText = { all: '#7c3aed', wedding: '#be185d', corporate: '#1d4ed8', birthday: '#a16207', concert: '#7c3aed', party: '#15803d', photography: '#0e7490', catering: '#b91c1c', entertainment: '#4338ca' };

const FALLBACK = [
  { _id: 'f1', title: 'Royal Wedding Package',      category: 'Wedding',   price: 250000, rating: 4.9, location: { city: 'Mumbai' },   providerId: { businessName: 'Dream Weddings Co.' },   eventImage: 'https://images.unsplash.com/photo-1767986012154-db9a321c8832?w=400&q=80' },
  { _id: 'f2', title: 'Corporate Annual Gala',       category: 'Corporate', price: 180000, rating: 4.8, location: { city: 'Delhi' },    providerId: { businessName: 'Elite Events Ltd.' },     eventImage: 'https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?w=400&q=80' },
  { _id: 'f3', title: 'Birthday Celebration Deluxe', category: 'Birthday',  price: 45000,  rating: 4.7, location: { city: 'Bangalore' }, providerId: { businessName: 'Party Paradise' },        eventImage: 'https://images.unsplash.com/photo-1583852542295-05d29d3cff55?w=400&q=80' },
  { _id: 'f4', title: 'Live Concert Experience',     category: 'Concert',   price: 95000,  rating: 4.9, location: { city: 'Hyderabad' }, providerId: { businessName: 'SoundWave Productions' }, eventImage: 'https://images.unsplash.com/photo-1631061434620-db65394197e2?w=400&q=80' },
  { _id: 'f5', title: 'Garden Party Setup',          category: 'Party',     price: 35000,  rating: 4.6, location: { city: 'Pune' },     providerId: { businessName: 'Garden Events Hub' },     eventImage: 'https://images.unsplash.com/photo-1698602807831-81066d89ed41?w=400&q=80' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First', icon: '🆕' },
  { value: 'price',  label: 'Price: Low → High', icon: '💰' },
  { value: 'rating', label: 'Highest Rated', icon: '⭐' },
];

/* ── Premium explore card (Zomato-style) ── */
const ExploreCard = ({ item, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const badgeBg   = catBg[item.category?.toLowerCase()]   || '#f3e8ff';
  const badgeClr  = catText[item.category?.toLowerCase()] || '#7c3aed';

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={styles.eCard} activeOpacity={0.88} onPress={onPress}>
        {/* Hero image */}
        <View style={styles.eImageWrap}>
          <Image source={{ uri: item.eventImage }} style={styles.eImage} resizeMode="cover" />

          {/* category pill */}
          <View style={[styles.eBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.eBadgeText, { color: badgeClr }]}>{item.category || 'Event'}</Text>
          </View>

          {/* wishlist */}
          <TouchableOpacity style={styles.eWishBtn} activeOpacity={0.8}>
            <Text style={{ fontSize: 16 }}>🤍</Text>
          </TouchableOpacity>

          {/* rating overlay */}
          <View style={styles.eRatingOverlay}>
            <Text style={styles.eRatingText}>⭐ {item.rating || '4.5'}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.eBody}>
          <Text style={styles.eTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.eProvider} numberOfLines={1}>
            🏢 {item.providerId?.businessName || 'Verified Provider'}
          </Text>

          {item.location?.city ? (
            <Text style={styles.eLocation}>📍 {item.location.city}</Text>
          ) : null}

          {/* price row */}
          <View style={styles.ePriceRow}>
            <View>
              <Text style={styles.ePriceLabel}>Starting from</Text>
              <Text style={styles.ePrice}>
                {item.price <= 1 ? '💬 On Request' : `₹${(item.price || 0).toLocaleString('en-IN')}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.eBookBtn} activeOpacity={0.85} onPress={onPress}>
              <Text style={styles.eBookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ExploreScreen = ({ navigation, route }) => {
  const [selected,   setSelected]   = useState(route?.params?.category || 'all');
  const [search,     setSearch]     = useState(route?.params?.searchQuery || '');
  const [sortBy,     setSortBy]     = useState('newest');
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSort,   setShowSort]   = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const params = { limit: 50, sortBy };
      if (selected !== 'all') params.category = selected;
      if (search.trim())      params.search   = search.trim();

      const res  = await api.get('/events', { params });
      const data = res.data?.data?.events || res.data?.events || [];
      setEvents(data.length > 0 ? data : FALLBACK);
    } catch {
      setEvents(FALLBACK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selected, search, sortBy]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    if (route?.params?.category)    setSelected(route.params.category);
    if (route?.params?.searchQuery) setSearch(route.params.searchQuery);
  }, [route?.params]);

  const onRefresh = () => { setRefreshing(true); fetchEvents(); };

  const enriched = events.map(e => ({ ...e, eventImage: getImageUri(e.eventImage) }));

  const activeCat = categories.find(c => c.id === selected) || categories[0];

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Hero header ── */}
      <View style={styles.heroHeader}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroTitle}>Explore</Text>
            <Text style={styles.heroSub}>Find your perfect event</Text>
          </View>
          {/* Sort button */}
          <TouchableOpacity
            style={styles.sortFab}
            activeOpacity={0.85}
            onPress={() => setShowSort(s => !s)}
          >
            <Text style={styles.sortFabIcon}>⚙️</Text>
            <Text style={styles.sortFabText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar inside header */}
        <View style={styles.heroSearch}>
          <Text style={styles.heroSearchIcon}>🔍</Text>
          <TextInput
            style={styles.heroSearchInput}
            placeholder="Search events, planners, venues..."
            placeholderTextColor="rgba(255,255,255,0.65)"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, paddingHorizontal: 6 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Sort dropdown ── */}
      {showSort && (
        <View style={styles.sortPanel}>
          <Text style={styles.sortPanelTitle}>Sort By</Text>
          {sortOptions.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortRow, sortBy === opt.value && styles.sortRowActive]}
              onPress={() => { setSortBy(opt.value); setShowSort(false); }}
            >
              <Text style={styles.sortRowIcon}>{opt.icon}</Text>
              <Text style={[styles.sortRowLabel, sortBy === opt.value && styles.sortRowLabelActive]}>
                {opt.label}
              </Text>
              {sortBy === opt.value && <Text style={styles.sortCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Category chips ── */}
      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {categories.map(cat => {
            const isActive = selected === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  isActive && { backgroundColor: catBg[cat.id] || '#f3e8ff', borderColor: catText[cat.id] || '#7c3aed' },
                ]}
                onPress={() => setSelected(cat.id)}
                activeOpacity={0.78}
              >
                <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                <Text style={[styles.chipLabel, isActive && { color: catText[cat.id] || '#7c3aed', fontWeight: '700' }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Results meta row ── */}
      <View style={styles.metaRow}>
        <Text style={styles.metaCount}>
          <Text style={styles.metaCountNum}>{enriched.length}</Text> results
          {selected !== 'all' ? ` · ${activeCat.name}` : ''}
        </Text>
        {selected !== 'all' && (
          <TouchableOpacity style={styles.clearChip} onPress={() => setSelected('all')}>
            <Text style={styles.clearChipText}>Clear ✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Event list ── */}
      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 48 }} size="large" />
      ) : (
        <FlatList
          data={enriched}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          renderItem={({ item }) => (
            <ExploreCard
              item={item}
              onPress={() => navigation.navigate('EventDetail', { event: item })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>🎪</Text>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySub}>Try a different category or search term</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => { setSelected('all'); setSearch(''); }}>
                <Text style={styles.emptyBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#f8fafc' },

  /* Hero header */
  heroHeader:      { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  heroTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  heroTitle:       { fontSize: 26, fontWeight: '800', color: '#fff' },
  heroSub:         { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroSearch:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  heroSearchIcon:  { fontSize: 15, marginRight: 8 },
  heroSearchInput: { flex: 1, fontSize: 14, color: '#fff' },

  /* Sort FAB */
  sortFab:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  sortFabIcon:  { fontSize: 14 },
  sortFabText:  { fontSize: 13, fontWeight: '700', color: '#fff' },

  /* Sort panel */
  sortPanel:       { marginHorizontal: 16, marginTop: 8, backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
  sortPanelTitle:  { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 8, letterSpacing: 0.5 },
  sortRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderRadius: 10, paddingHorizontal: 8, gap: 10 },
  sortRowActive:   { backgroundColor: '#f3e8ff' },
  sortRowIcon:     { fontSize: 16 },
  sortRowLabel:    { flex: 1, fontSize: 14, color: '#475569', fontWeight: '500' },
  sortRowLabelActive: { color: '#7c3aed', fontWeight: '700' },
  sortCheck:       { fontSize: 16, color: '#7c3aed', fontWeight: '800' },

  /* Category chips */
  chipsWrap: { paddingTop: 12 },
  chipsRow:  { paddingHorizontal: 16, gap: 8 },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0' },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontSize: 13, fontWeight: '500', color: '#64748b' },

  /* Meta row */
  metaRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  metaCount:      { fontSize: 13, color: '#64748b', fontWeight: '500' },
  metaCountNum:   { fontWeight: '800', color: '#0f172a' },
  clearChip:      { backgroundColor: '#ede9fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  clearChipText:  { fontSize: 12, color: '#7c3aed', fontWeight: '700' },

  /* List */
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },

  /* Explore card */
  eCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  eImageWrap:       { position: 'relative', width: '100%', height: 200 },
  eImage:           { width: '100%', height: '100%' },
  eBadge:           { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  eBadgeText:       { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  eWishBtn:         { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  eRatingOverlay:   { position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  eRatingText:      { fontSize: 12, fontWeight: '700', color: '#facc15' },
  eBody:            { padding: 16 },
  eTitle:           { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 4, lineHeight: 22 },
  eProvider:        { fontSize: 13, color: '#64748b', marginBottom: 3, fontWeight: '500' },
  eLocation:        { fontSize: 12, color: '#94a3b8', marginBottom: 10 },
  ePriceRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  ePriceLabel:      { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  ePrice:           { fontSize: 19, fontWeight: '800', color: '#7c3aed' },
  eBookBtn:         { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  eBookBtnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },

  /* Empty */
  emptyWrap:  { alignItems: 'center', paddingVertical: 70 },
  emptyEmoji: { fontSize: 54, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#475569', marginBottom: 6 },
  emptySub:   { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 32, marginBottom: 22 },
  emptyBtn:   { backgroundColor: '#7c3aed', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
