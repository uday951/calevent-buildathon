import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '../components/EventCard';
import api from '../services/api';
import { getImageUri } from '../utils/normalize';

const { width } = Dimensions.get('window');
const CARD_W = (width - 16 * 2 - 10) / 2;      // 2-col with 10 gap

const FALLBACK_EVENTS = [
  { _id: '1', title: 'Royal Wedding Package',       category: 'Wedding',   price: 250000, rating: 4.9, providerId: { businessName: 'Dream Weddings Co.' },    eventImage: 'https://images.unsplash.com/photo-1767986012154-db9a321c8832?w=400&q=80' },
  { _id: '2', title: 'Corporate Annual Gala',        category: 'Corporate', price: 180000, rating: 4.8, providerId: { businessName: 'Elite Events Ltd.' },      eventImage: 'https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?w=400&q=80' },
  { _id: '3', title: 'Birthday Celebration Deluxe',  category: 'Birthday',  price: 45000,  rating: 4.7, providerId: { businessName: 'Party Paradise' },         eventImage: 'https://images.unsplash.com/photo-1583852542295-05d29d3cff55?w=400&q=80' },
  { _id: '4', title: 'Live Concert Experience',      category: 'Concert',   price: 95000,  rating: 4.9, providerId: { businessName: 'SoundWave Productions' },  eventImage: 'https://images.unsplash.com/photo-1631061434620-db65394197e2?w=400&q=80' },
  { _id: '5', title: 'Garden Party Setup',           category: 'Party',     price: 35000,  rating: 4.6, providerId: { businessName: 'Garden Events Hub' },      eventImage: 'https://images.unsplash.com/photo-1698602807831-81066d89ed41?w=400&q=80' },
  { _id: '6', title: 'Premium Catering Service',     category: 'Catering',  price: 28000,  rating: 4.5, providerId: { businessName: 'RoyalBites Catering' },    eventImage: 'https://images.unsplash.com/photo-1774025967891-b4ed833e57ac?w=400&q=80' },
  { _id: '7', title: 'Destination Wedding',          category: 'Wedding',   price: 420000, rating: 5.0, providerId: { businessName: 'Grand Vows Co.' },         eventImage: 'https://images.unsplash.com/photo-1609519855086-70ef5a55c0f0?w=400&q=80' },
  { _id: '8', title: 'Corporate Team Retreat',       category: 'Corporate', price: 120000, rating: 4.6, providerId: { businessName: 'WorkLifeBalance Inc.' },   eventImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80' },
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

/* ── Category accent colours for "Discover More" chips ── */
const catColor = {
  Wedding:   '#f43f5e',
  Corporate: '#3b82f6',
  Birthday:  '#f59e0b',
  Concert:   '#8b5cf6',
  Party:     '#10b981',
  Catering:  '#ef4444',
};

/* ── Flash Offers data ── */
const flashOffers = [
  { id: 'fo1', title: 'Wedding Decor', discount: '55% OFF', originalPrice: '₹80,000', offerPrice: '₹36,000', bg: ['#7c3aed', '#a855f7'], emoji: '💒', tag: 'MEGA', expires: '2h 45m' },
  { id: 'fo2', title: 'DJ & Sound',    discount: '40% OFF', originalPrice: '₹25,000', offerPrice: '₹15,000', bg: ['#be185d', '#f43f5e'], emoji: '🎧', tag: 'HOT',  expires: '5h 10m' },
  { id: 'fo3', title: 'Photography',   discount: '30% OFF', originalPrice: '₹40,000', offerPrice: '₹28,000', bg: ['#0e7490', '#06b6d4'], emoji: '📸', tag: 'NEW',  expires: '8h 00m' },
  { id: 'fo4', title: 'Catering 100+', discount: '20% OFF', originalPrice: '₹60,000', offerPrice: '₹48,000', bg: ['#b45309', '#f59e0b'], emoji: '🍽️', tag: 'SALE', expires: '12h 30m' },
];

/* ── Top Vendors data ── */
const topVendors = [
  { id: 'v1', name: 'Dream Weddings', initials: 'DW', specialty: 'Wedding Planning', rating: 4.9, reviews: 312, color: '#7c3aed', badge: '🥇 #1 Rated' },
  { id: 'v2', name: 'SoundWave Pro',  initials: 'SW', specialty: 'DJ & Audio',        rating: 4.8, reviews: 215, color: '#be185d', badge: '🔥 Trending' },
  { id: 'v3', name: 'LensArt Studio', initials: 'LA', specialty: 'Photography',        rating: 4.9, reviews: 189, color: '#0e7490', badge: '⭐ Premium' },
  { id: 'v4', name: 'RoyalBites',     initials: 'RB', specialty: 'Catering',           rating: 4.7, reviews: 278, color: '#b45309', badge: '🍽️ Top Chef' },
  { id: 'v5', name: 'BloomDecor',     initials: 'BD', specialty: 'Floral & Decor',     rating: 4.8, reviews: 143, color: '#047857', badge: '🌸 Loved' },
];

/* ── Launching in Your City Soon ── */
const launchingCities = [
  { id: 'lc1', city: 'Mumbai',    status: 'Coming Soon', eta: 'Q2 2026', image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&q=80', icon: '🚀' },
  { id: 'lc2', city: 'Delhi',     status: 'Coming Soon', eta: 'Q2 2026', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', icon: '🎯' },
  { id: 'lc3', city: 'Bangalore', status: 'Coming Soon', eta: 'Q3 2026', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80', icon: '⭐' },
  { id: 'lc4', city: 'Hyderabad', status: 'Coming Soon', eta: 'Q3 2026', image: 'https://images.unsplash.com/photo-1609519855086-70ef5a55c0f0?w=400&q=80', icon: '🎉' },
  { id: 'lc5', city: 'Chennai',   status: 'Coming Soon', eta: 'Q3 2026', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80', icon: '💫' },
  { id: 'lc6', city: 'Pune',      status: 'Coming Soon', eta: 'Q4 2026', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', icon: '🌟' },
];

/* ── Grid card for Discover More ── */
const DiscoverCard = ({ event, onPress, tall }) => (
  <TouchableOpacity
    style={[styles.discoverCard, tall && { height: 200 }]}
    activeOpacity={0.88}
    onPress={onPress}
  >
    <Image source={{ uri: event.eventImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
    {/* gradient overlay */}
    <View style={styles.discoverGradient} />

    {/* category chip */}
    <View style={[styles.discoverChip, { backgroundColor: catColor[event.category] || '#7c3aed' }]}>
      <Text style={styles.discoverChipText}>{event.category || 'Event'}</Text>
    </View>

    {/* rating pill */}
    <View style={styles.discoverRating}>
      <Text style={styles.discoverRatingText}>⭐ {event.rating || '4.5'}</Text>
    </View>

    {/* bottom info */}
    <View style={styles.discoverBottom}>
      <Text style={styles.discoverTitle} numberOfLines={2}>{event.title}</Text>
      <Text style={styles.discoverProvider} numberOfLines={1}>
        {event.providerId?.businessName || 'Verified Provider'}
      </Text>
      <Text style={styles.discoverPrice}>
        {event.price <= 1 ? '💬 On Request' : `₹${(event.price || 0).toLocaleString('en-IN')}`}
      </Text>
    </View>
  </TouchableOpacity>
);

export const HomeScreen = ({ navigation }) => {
  const [search,     setSearch]     = useState('');
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res  = await api.get('/events', { params: { limit: 20 } });
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

  const enriched = filtered.map(e => ({ ...e, eventImage: getImageUri(e.eventImage) }));
  const discoverItems = enriched.slice(4);

  /* build 2-column pairs */
  const pairs = [];
  for (let i = 0; i < discoverItems.length; i += 2) {
    pairs.push([discoverItems[i], discoverItems[i + 1] || null]);
  }

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

        {/* Plan My Event CTA */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.planBtn} activeOpacity={0.85} onPress={() => navigation.navigate('PlanMyEvent')}>
            <Text style={styles.planBtnText}>🎯 Plan My Event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trackBtn} activeOpacity={0.85} onPress={() => navigation.navigate('MyRequests')}>
            <Text style={styles.trackBtnText}>📋 My Requests</Text>
          </TouchableOpacity>
        </View>

        {/* ⚡ Flash Offers */}
        <View style={[styles.section, { backgroundColor: '#fafafa', paddingBottom: 8 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.sectionTitle, { color: '#0f172a' }]}>⚡ FLASH OFFERS</Text>
              <View style={styles.liveDot}><Text style={styles.liveDotText}>LIVE</Text></View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('FlashOffers')}>
              <Text style={styles.seeAll}>View All ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {flashOffers.map(offer => (
              <TouchableOpacity key={offer.id} style={[styles.flashCard, { backgroundColor: offer.bg[0] }]} activeOpacity={0.88} onPress={() => navigation.navigate('FlashOffers')}>
                {/* tag badge */}
                <View style={styles.flashTag}><Text style={styles.flashTagText}>{offer.tag}</Text></View>
                {/* emoji */}
                <Text style={styles.flashEmoji}>{offer.emoji}</Text>
                {/* discount */}
                <Text style={styles.flashDiscount}>{offer.discount}</Text>
                <Text style={styles.flashTitle}>{offer.title}</Text>
                {/* prices */}
                <Text style={styles.flashOrigPrice}>{offer.originalPrice}</Text>
                <Text style={styles.flashOfferPrice}>{offer.offerPrice}</Text>
                {/* timer */}
                <View style={styles.flashTimer}>
                  <Text style={styles.flashTimerText}>⏱ {offer.expires} left</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
                    <View style={styles.bannerBtn}><Text style={styles.bannerBtnText}>{b.btn}</Text></View>
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

        {/* 🏆 Top Rated Vendors */}
        <View style={[styles.section, { backgroundColor: '#0f172a' }]}>
          <View style={[styles.sectionHeader, { paddingTop: 4 }]}>
            <Text style={[styles.sectionTitle, { color: '#fff' }]}>🏆 TOP RATED VENDORS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={[styles.seeAll, { color: '#a78bfa' }]}>See All ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {topVendors.map(v => (
              <TouchableOpacity key={v.id} style={styles.vendorCard} activeOpacity={0.88} onPress={() => navigation.navigate('Explore')}>
                {/* Avatar */}
                <View style={[styles.vendorAvatar, { backgroundColor: v.color }]}>
                  <Text style={styles.vendorAvatarText}>{v.initials}</Text>
                </View>
                {/* Badge */}
                <View style={styles.vendorBadge}><Text style={styles.vendorBadgeText}>{v.badge}</Text></View>
                {/* Info */}
                <Text style={styles.vendorName} numberOfLines={1}>{v.name}</Text>
                <Text style={styles.vendorSpecialty} numberOfLines={1}>{v.specialty}</Text>
                {/* Rating row */}
                <View style={styles.vendorRatingRow}>
                  <Text style={styles.vendorRatingStar}>⭐ {v.rating}</Text>
                  <Text style={styles.vendorReviews}>{v.reviews} reviews</Text>
                </View>
                <TouchableOpacity style={[styles.vendorBookBtn, { backgroundColor: v.color }]} activeOpacity={0.85}>
                  <Text style={styles.vendorBookBtnText}>Enquire</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

        {/* 🚀 Launching in Your City Soon */}
        <View style={[styles.section, { backgroundColor: '#0f172a' }]}>
          <View style={[styles.sectionHeader, { paddingTop: 4 }]}>
            <Text style={[styles.sectionTitle, { color: '#fff' }]}>🚀 LAUNCHING IN YOUR CITY SOON</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
            {launchingCities.map(lc => (
              <View key={lc.id} style={styles.launchCard}>
                <Image source={{ uri: lc.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                {/* gradient overlay */}
                <View style={styles.launchOverlay} />
                
                {/* Icon */}
                <Text style={styles.launchIcon}>{lc.icon}</Text>
                
                {/* Content */}
                <View style={styles.launchContent}>
                  <Text style={styles.launchCity}>{lc.city}</Text>
                  <View style={styles.launchStatusBadge}>
                    <Text style={styles.launchStatusText}>{lc.status}</Text>
                  </View>
                  <Text style={styles.launchEta}>Expected: {lc.eta}</Text>
                  <TouchableOpacity style={styles.notifyBtn}>
                    <Text style={styles.notifyBtnText}>🔔 Notify Me</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ═══════════════════════════════════════════
            DISCOVER MORE  — premium 2-col image grid
            ═══════════════════════════════════════════ */}
        <View style={[styles.section, { paddingHorizontal: 16 }]}>
          {/* Section header with accent line */}
          <View style={styles.discoverHeader}>
            <View style={styles.discoverAccent} />
            <Text style={styles.discoverSectionTitle}>DISCOVER MORE</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.seeAll}>View All ›</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#7c3aed" style={{ marginVertical: 20 }} />
          ) : discoverItems.length > 0 ? (
            <View style={styles.discoverGrid}>
              {pairs.map((pair, pi) => (
                <View key={pi} style={styles.discoverRow}>
                  {/* left card — taller every other row */}
                  <DiscoverCard
                    event={pair[0]}
                    onPress={() => goToDetail(pair[0])}
                    tall={pi % 2 === 0}
                  />
                  {/* right card */}
                  {pair[1] ? (
                    <DiscoverCard
                      event={pair[1]}
                      onPress={() => goToDetail(pair[1])}
                      tall={pi % 2 !== 0}
                    />
                  ) : (
                    /* placeholder so layout doesn't break on odd count */
                    <View style={[styles.discoverCard, { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>{search ? 'No events match your search' : 'No more events'}</Text>
            </View>
          )}
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 24 }} />
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
  ctaRow:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  planBtn:        { flex: 1, backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  planBtnText:    { color: '#fff', fontWeight: '700', fontSize: 14 },
  trackBtn:       { flex: 1, borderWidth: 1.5, borderColor: '#7c3aed', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  trackBtnText:   { color: '#7c3aed', fontWeight: '700', fontSize: 14 },

  /* ── Discover More ── */
  discoverHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  discoverAccent:      { width: 4, height: 18, borderRadius: 2, backgroundColor: '#7c3aed' },
  discoverSectionTitle:{ fontSize: 15, fontWeight: '800', color: '#0f172a', letterSpacing: 0.5, flex: 1 },

  discoverGrid:        { gap: 10 },
  discoverRow:         { flexDirection: 'row', gap: 10 },

  discoverCard: {
    flex: 1,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  discoverGradient: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
    // Simulate gradient: dark bottom
    backgroundColor: 'transparent',
    // We'll use overlapping view trick below
  },
  discoverChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  discoverChipText: { fontSize: 10, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  discoverRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discoverRatingText: { fontSize: 10, fontWeight: '700', color: '#facc15' },
  discoverBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  discoverTitle:    { fontSize: 13, fontWeight: '700', color: '#fff', lineHeight: 17, marginBottom: 1 },
  discoverProvider: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 3 },
  discoverPrice:    { fontSize: 13, fontWeight: '800', color: '#facc15' },

  /* ── Flash Offers ── */
  liveDot:          { backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  liveDotText:      { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  flashCard: {
    width: 148,
    borderRadius: 18,
    padding: 14,
    paddingBottom: 12,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 4,
  },
  flashTag:       { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 8 },
  flashTagText:   { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  flashEmoji:     { fontSize: 30, marginBottom: 6 },
  flashDiscount:  { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 2 },
  flashTitle:     { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  flashOrigPrice: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textDecorationLine: 'line-through', marginBottom: 2 },
  flashOfferPrice:{ fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 10 },
  flashTimer:     { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  flashTimerText: { fontSize: 10, color: '#facc15', fontWeight: '700' },

  /* ── Top Vendors ── */
  vendorCard: {
    width: 148,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 4,
  },
  vendorAvatar:      { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  vendorAvatarText:  { fontSize: 22, fontWeight: '800', color: '#fff' },
  vendorBadge:       { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginBottom: 8 },
  vendorBadgeText:   { fontSize: 10, color: '#facc15', fontWeight: '700' },
  vendorName:        { fontSize: 14, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 2 },
  vendorSpecialty:   { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginBottom: 8 },
  vendorRatingRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  vendorRatingStar:  { fontSize: 12, fontWeight: '700', color: '#facc15' },
  vendorReviews:     { fontSize: 10, color: '#64748b' },
  vendorBookBtn:     { width: '100%', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  vendorBookBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  /* ── Launching Cities ── */
  launchCard: {
    width: 180,
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 4,
  },
  launchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124,58,237,0.85)',
  },
  launchIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginTop: 24,
  },
  launchContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  launchCity: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  launchStatusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  launchStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#facc15',
    letterSpacing: 0.5,
  },
  launchEta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  notifyBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  notifyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
  },
});
