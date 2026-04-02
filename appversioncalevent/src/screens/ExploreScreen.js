import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCardCompact } from '../components/EventCardCompact';
import api from '../services/api';

const categories = [
  { id: 'all',           name: 'All',           emoji: '✨', bg: '#f3e8ff', text: '#7c3aed' },
  { id: 'wedding',       name: 'Wedding',        emoji: '💒', bg: '#fce7f3', text: '#be185d' },
  { id: 'corporate',     name: 'Corporate',      emoji: '🏢', bg: '#dbeafe', text: '#1d4ed8' },
  { id: 'birthday',      name: 'Birthday',       emoji: '🎂', bg: '#fef9c3', text: '#a16207' },
  { id: 'concert',       name: 'Concert',        emoji: '🎵', bg: '#f3e8ff', text: '#7c3aed' },
  { id: 'party',         name: 'Party',          emoji: '🎉', bg: '#dcfce7', text: '#15803d' },
  { id: 'photography',   name: 'Photography',    emoji: '📸', bg: '#cffafe', text: '#0e7490' },
  { id: 'catering',      name: 'Catering',       emoji: '🍽️', bg: '#fee2e2', text: '#b91c1c' },
  { id: 'entertainment', name: 'Entertainment',  emoji: '🎭', bg: '#e0e7ff', text: '#4338ca' },
];

const FALLBACK = [
  { _id: 'f1', title: 'Royal Wedding Package',      category: 'Wedding',   price: 250000, rating: 4.9, providerId: { businessName: 'Dream Weddings Co.' },   eventImage: 'https://images.unsplash.com/photo-1767986012154-db9a321c8832?w=400&q=80' },
  { _id: 'f2', title: 'Corporate Annual Gala',       category: 'Corporate', price: 180000, rating: 4.8, providerId: { businessName: 'Elite Events Ltd.' },     eventImage: 'https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?w=400&q=80' },
  { _id: 'f3', title: 'Birthday Celebration Deluxe', category: 'Birthday',  price: 45000,  rating: 4.7, providerId: { businessName: 'Party Paradise' },        eventImage: 'https://images.unsplash.com/photo-1583852542295-05d29d3cff55?w=400&q=80' },
  { _id: 'f4', title: 'Live Concert Experience',     category: 'Concert',   price: 95000,  rating: 4.9, providerId: { businessName: 'SoundWave Productions' }, eventImage: 'https://images.unsplash.com/photo-1631061434620-db65394197e2?w=400&q=80' },
  { _id: 'f5', title: 'Garden Party Setup',          category: 'Party',     price: 35000,  rating: 4.6, providerId: { businessName: 'Garden Events Hub' },     eventImage: 'https://images.unsplash.com/photo-1698602807831-81066d89ed41?w=400&q=80' },
];

export const ExploreScreen = ({ navigation, route }) => {
  const [selected,   setSelected]   = useState(route?.params?.category || 'all');
  const [search,     setSearch]     = useState(route?.params?.searchQuery || '');
  const [sortBy,     setSortBy]     = useState('newest');
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSort,   setShowSort]   = useState(false);

  const sortOptions = [
    { value: 'newest',  label: 'Newest First' },
    { value: 'price',   label: 'Price: Low to High' },
    { value: 'rating',  label: 'Highest Rated' },
  ];

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

  // Sync route params (from HomeScreen category circle tap)
  useEffect(() => {
    if (route?.params?.category) setSelected(route.params.category);
    if (route?.params?.searchQuery) setSearch(route.params.searchQuery);
  }, [route?.params]);

  const onRefresh = () => { setRefreshing(true); fetchEvents(); };

  const getImageUri = (event) => {
    if (!event.eventImage) return 'https://picsum.photos/400/300?random=1';
    if (event.eventImage.startsWith('http')) return event.eventImage;
    return `${api.defaults.baseURL?.replace('/api', '')}/${event.eventImage}`;
  };

  const enriched = events.map(e => ({ ...e, eventImage: getImageUri(e) }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSub}>Discover events by category</Text>
      </View>

      {/* Search + Sort */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94a3b8', fontSize: 16, paddingHorizontal: 6 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
          <Text style={styles.sortBtnText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Dropdown */}
      {showSort && (
        <View style={styles.sortDropdown}>
          {sortOptions.map(opt => (
            <TouchableOpacity key={opt.value} style={[styles.sortOption, sortBy === opt.value && styles.sortOptionActive]} onPress={() => { setSortBy(opt.value); setShowSort(false); }}>
              <Text style={[styles.sortOptionText, sortBy === opt.value && styles.sortOptionTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category Pills */}
      <View style={styles.pillsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, selected === cat.id && { backgroundColor: cat.bg, borderColor: cat.text }]}
              onPress={() => setSelected(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.pillEmoji}>{cat.emoji}</Text>
              <Text style={[styles.pillText, selected === cat.id && { color: cat.text, fontWeight: '700' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>Showing {enriched.length} events</Text>
        {selected !== 'all' && (
          <TouchableOpacity onPress={() => setSelected('all')}>
            <Text style={styles.clearText}>Clear filter ✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Events List */}
      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={enriched}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          renderItem={({ item }) => (
            <EventCardCompact event={item} onPress={() => navigation.navigate('EventDetail', { event: item })} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySub}>Try a different category or search term</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:                 { flex: 1, backgroundColor: '#f8fafc' },
  headerBg:             { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle:          { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerSub:            { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  searchRow:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  searchWrap:           { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e2e8f0' },
  searchIcon:           { fontSize: 15, marginRight: 8 },
  searchInput:          { flex: 1, fontSize: 14, color: '#0f172a' },
  sortBtn:              { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  sortBtnText:          { fontSize: 18 },
  sortDropdown:         { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', marginTop: 4 },
  sortOption:           { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sortOptionActive:     { backgroundColor: '#f3e8ff' },
  sortOptionText:       { fontSize: 14, color: '#64748b', fontWeight: '500' },
  sortOptionTextActive: { color: '#7c3aed', fontWeight: '700' },
  pillsWrap:            { paddingTop: 12 },
  pillsRow:             { paddingHorizontal: 16, gap: 8 },
  pill:                 { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0' },
  pillEmoji:            { fontSize: 14 },
  pillText:             { fontSize: 13, fontWeight: '500', color: '#64748b' },
  countRow:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  countText:            { fontSize: 13, color: '#64748b', fontWeight: '500' },
  clearText:            { fontSize: 13, color: '#7c3aed', fontWeight: '600' },
  list:                 { paddingHorizontal: 16, paddingBottom: 24 },
  empty:                { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:            { fontSize: 48, marginBottom: 12 },
  emptyTitle:           { fontSize: 17, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  emptySub:             { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
});
