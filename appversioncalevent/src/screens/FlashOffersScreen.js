import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { getImageUri } from '../utils/normalize';

const { width } = Dimensions.get('window');

export const FlashOffersScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events', { params: { limit: 50 } });
      const data = res.data?.data?.events || res.data?.events || [];
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToDetail = (event) => navigation.navigate('EventDetail', { event });

  const formatPrice = (price) => {
    if (price <= 1) return '💬 Price will be discussed';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDiscount = (index) => {
    const discounts = ['55% OFF', '40% OFF', '35% OFF', '30% OFF', '25% OFF', '20% OFF'];
    return discounts[index % discounts.length];
  };

  const getTag = (index) => {
    const tags = ['MEGA', 'HOT', 'NEW', 'SALE', 'DEAL', 'FLASH'];
    return tags[index % tags.length];
  };

  const getGradient = (index) => {
    const gradients = [
      ['#7c3aed', '#a855f7'],
      ['#be185d', '#f43f5e'],
      ['#0e7490', '#06b6d4'],
      ['#b45309', '#f59e0b'],
      ['#047857', '#10b981'],
      ['#4338ca', '#6366f1'],
    ];
    return gradients[index % gradients.length];
  };

  const getTimer = (index) => {
    const timers = ['2h 45m', '5h 10m', '8h 00m', '12h 30m', '18h 15m', '24h 00m'];
    return timers[index % timers.length];
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.headerTitle}>⚡ FLASH OFFERS</Text>
          <View style={styles.liveDot}>
            <Text style={styles.liveDotText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>LIMITED TIME ONLY</Text>
          <Text style={styles.heroTitle}>Mega Flash Sale</Text>
          <Text style={styles.heroSubtitle}>Up to 55% OFF on Premium Events</Text>
          <View style={styles.heroTimer}>
            <Text style={styles.heroTimerIcon}>⏱</Text>
            <Text style={styles.heroTimerText}>Ends in 23h 45m</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Flash Offers Grid */}
          <View style={styles.offersGrid}>
            {events.map((event, index) => {
              const gradient = getGradient(index);
              const discount = getDiscount(index);
              const tag = getTag(index);
              const timer = getTimer(index);
              const enrichedEvent = { ...event, eventImage: getImageUri(event.eventImage) };

              return (
                <TouchableOpacity
                  key={event._id}
                  style={[styles.offerCard, { backgroundColor: gradient[0] }]}
                  activeOpacity={0.88}
                  onPress={() => goToDetail(enrichedEvent)}
                >
                  {/* Background Image with Overlay */}
                  <Image source={{ uri: enrichedEvent.eventImage }} style={styles.offerBgImage} />
                  <View style={styles.offerOverlay} />

                  {/* Tag Badge */}
                  <View style={styles.offerTag}>
                    <Text style={styles.offerTagText}>{tag}</Text>
                  </View>

                  {/* Timer */}
                  <View style={styles.offerTimer}>
                    <Text style={styles.offerTimerText}>⏱ {timer}</Text>
                  </View>

                  {/* Content */}
                  <View style={styles.offerContent}>
                    {/* Discount Badge */}
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{discount}</Text>
                    </View>

                    {/* Event Info */}
                    <Text style={styles.offerTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <Text style={styles.offerCategory}>{event.category}</Text>

                    {/* Price */}
                    <View style={styles.priceRow}>
                      {event.price > 1 && (
                        <Text style={styles.originalPrice}>
                          ₹{Math.floor(event.price * 1.8).toLocaleString('en-IN')}
                        </Text>
                      )}
                      <Text style={styles.offerPrice}>{formatPrice(event.price)}</Text>
                    </View>

                    {/* Book Now Button */}
                    <TouchableOpacity
                      style={styles.bookNowBtn}
                      onPress={() => goToDetail(enrichedEvent)}
                    >
                      <Text style={styles.bookNowText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Spacer */}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { marginRight: 12 },
  backArrow: { fontSize: 24, color: '#0f172a' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', letterSpacing: 0.5 },
  liveDot: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroBanner: {
    backgroundColor: '#7c3aed',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: { alignItems: 'center' },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#facc15',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  heroTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  heroTimerIcon: { fontSize: 18 },
  heroTimerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#facc15',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 16 },
  offersGrid: { gap: 16 },
  offerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  offerBgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  offerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  offerTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  offerTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  offerTimer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  offerTimerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#facc15',
  },
  offerContent: { padding: 20, paddingTop: 60 },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#facc15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  discountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 26,
    marginBottom: 6,
  },
  offerCategory: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'line-through',
  },
  offerPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  bookNowBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookNowText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7c3aed',
  },
});
