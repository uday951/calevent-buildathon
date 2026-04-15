import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
  Dimensions, ActivityIndicator, Share, Modal,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Badge } from '../components/ui/Badge';
import { EventCardCompact } from '../components/EventCardCompact';
import api from '../services/api';
import { getImageUri as resolveImage } from '../utils/normalize';

const { width } = Dimensions.get('window');

const INCLUDED = ['Professional event coordination', 'Venue decoration and setup', 'Catering services', 'Photography & videography'];

export const EventDetailScreen = ({ route, navigation }) => {
  const passedEvent = route?.params?.event;
  const eventId     = passedEvent?._id || route?.params?.eventId;

  const [event,       setEvent]       = useState(passedEvent || null);
  const [similar,     setSimilar]     = useState([]);
  const [loading,     setLoading]     = useState(!passedEvent);
  const [favorite,    setFavorite]    = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (!passedEvent && eventId) {
      api.get(`/events/${eventId}`)
        .then(res => setEvent(res.data?.data?.event || res.data?.event || null))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [eventId]);

  useEffect(() => {
    if (event?.category) {
      api.get('/events', { params: { category: event.category, limit: 4 } })
        .then(res => {
          const data = res.data?.data?.events || res.data?.events || [];
          setSimilar(data.filter(e => e._id !== event._id).slice(0, 3));
        })
        .catch(() => {});
    }
  }, [event?.category]);

  const getImageUri = (e) => resolveImage(e?.eventImage);

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out ${event?.title} on CALEVENT! Starting from ₹${(event?.price || 0).toLocaleString('en-IN')}` });
    } catch {}
  };

  const handleBookNow = () => {
    navigation.navigate('BookEvent', { event: event });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#7c3aed" size="large" /></View>;

  if (!event) return (
    <View style={styles.center}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>😕</Text>
      <Text style={{ fontSize: 17, fontWeight: '700', color: '#64748b' }}>Event not found</Text>
      <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
        <Text style={styles.backLinkText}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const imageUri       = getImageUri(event);
  const providerAvatar = (event.providerId?.businessName || event.providerId?.name || 'EV').slice(0, 2).toUpperCase();
  const features       = event.features?.length > 0 ? event.features : INCLUDED;

  return (
    <View style={styles.root}>

      {/* ── Image Lightbox with Zoom ── */}
      <Modal visible={showLightbox} transparent onRequestClose={() => setShowLightbox(false)}>
        <ImageViewer
          imageUrls={[{ url: imageUri }]}
          enableSwipeDown
          onSwipeDown={() => setShowLightbox(false)}
          backgroundColor="rgba(0,0,0,0.97)"
          renderIndicator={() => null}
          saveToLocalByLongPress={false}
          renderHeader={() => (
            <TouchableOpacity style={styles.lbClose} onPress={() => setShowLightbox(false)} activeOpacity={0.8}>
              <Text style={styles.lbCloseText}>✕</Text>
            </TouchableOpacity>
          )}
          renderFooter={() => (
            <Text style={styles.lbHint}>Pinch to zoom  ·  Swipe down to close</Text>
          )}
        />
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero */}
        <View>
          <TouchableOpacity activeOpacity={0.92} onPress={() => setShowLightbox(true)}>
            <Image source={{ uri: imageUri }} style={styles.heroImg} resizeMode="cover" />
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>🔍 Tap to view</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
            <Text style={{ fontSize: 18 }}>↗️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favBtn} onPress={() => setFavorite(f => !f)} activeOpacity={0.85}>
            <Text style={{ fontSize: 18 }}>{favorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Badge style={styles.badge}>{event.category}</Badge>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Text>⭐</Text>
              <Text style={styles.ratingVal}>{event.rating || '4.5'}</Text>
              <Text style={styles.ratingCount}>({event.reviews?.length || event.totalReviews || 0} reviews)</Text>
            </View>
            {event.maxCapacity && (
              <Text style={styles.capacityText}>👥 Up to {event.maxCapacity} guests</Text>
            )}
          </View>

          {(event.location || event.duration) && (
            <View style={styles.metaRow}>
              {event.location && <Text style={styles.metaText}>📍 {typeof event.location === 'object' ? event.location.city : event.location}</Text>}
              {event.duration  && <Text style={styles.metaText}>⏱️ {event.duration}</Text>}
            </View>
          )}

          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>{providerAvatar}</Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerLabel}>Provided by</Text>
              <Text style={styles.providerName}>{event.providerId?.businessName || event.providerId?.name || 'Verified Provider'}</Text>
              {event.providerId?.totalBookings > 0 && (
                <Text style={styles.providerMeta}>{event.providerId.totalBookings} bookings completed</Text>
              )}
            </View>
          </View>

          <View style={styles.priceCard}>
            {event.price <= 1 ? (
              <View style={styles.discussPriceBox}>
                <Text style={styles.discussIcon}>💬</Text>
                <Text style={styles.discussTitle}>Price will be discussed</Text>
                <Text style={styles.discussSubtitle}>Get a customized quote based on your requirements</Text>
              </View>
            ) : (
              <>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{(event.price || 0).toLocaleString('en-IN')}</Text>
                  {event.originalPrice && (
                    <Text style={styles.originalPrice}>₹{event.originalPrice.toLocaleString('en-IN')}</Text>
                  )}
                </View>
                <Text style={styles.priceLabel}>Starting price{event.minCapacity ? ` for ${event.minCapacity} guests` : ''}</Text>
              </>
            )}
          </View>

          {event.description && (
            <>
              <Text style={styles.sectionHead}>About this event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </>
          )}

          <View style={styles.includedCard}>
            <Text style={styles.includedHead}>What's included</Text>
            {features.map((item, i) => (
              <View key={i} style={styles.includedRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.includedText}>{item}</Text>
              </View>
            ))}
          </View>

          {similar.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.sectionHead}>Similar Events</Text>
              {similar.map(e => (
                <EventCardCompact
                  key={e._id}
                  event={{ ...e, eventImage: getImageUri(e) }}
                  onPress={() => navigation.push('EventDetail', { event: e })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {event.price <= 1 ? (
          <View>
            <Text style={styles.bottomLabel}>Pricing</Text>
            <Text style={styles.bottomDiscuss}>💬 Will be discussed</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.bottomLabel}>Total Price</Text>
            <Text style={styles.bottomPrice}>₹{(event.price || 0).toLocaleString('en-IN')}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85} onPress={handleBookNow}>
          <Text style={styles.bookBtnText}>{event.price <= 1 ? 'Get Quote' : 'Book Now'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root:               { flex: 1, backgroundColor: '#f8fafc' },
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' },
  backLink:           { marginTop: 16 },
  backLinkText:       { fontSize: 15, color: '#7c3aed', fontWeight: '600' },
  // Lightbox
  lbClose:            { position: 'absolute', top: 52, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  lbCloseText:        { color: '#fff', fontSize: 18, fontWeight: '700' },
  lbHint:             { position: 'absolute', bottom: 36, left: 0, right: 0, color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', paddingHorizontal: 20 },
  // Hero
  heroImg:            { width, height: 260 },
  tapHint:            { position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tapHintText:        { color: '#fff', fontSize: 11, fontWeight: '600' },
  backBtn:            { position: 'absolute', top: 48, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  backArrow:          { fontSize: 20, color: '#0f172a' },
  shareBtn:           { position: 'absolute', top: 48, right: 64, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  favBtn:             { position: 'absolute', top: 48, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  content:            { padding: 20 },
  badge:              { marginBottom: 12 },
  title:              { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 10, lineHeight: 32 },
  metaRow:            { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' },
  ratingRow:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingVal:          { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  ratingCount:        { fontSize: 13, color: '#64748b' },
  capacityText:       { fontSize: 13, color: '#64748b' },
  metaText:           { fontSize: 13, color: '#64748b' },
  providerCard:       { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  providerAvatar:     { width: 46, height: 46, borderRadius: 23, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  providerAvatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  providerInfo:       { flex: 1 },
  providerLabel:      { fontSize: 12, color: '#64748b' },
  providerName:       { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  providerMeta:       { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  priceCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  discussPriceBox:    { alignItems: 'center', paddingVertical: 8 },
  discussIcon:        { fontSize: 32, marginBottom: 8 },
  discussTitle:       { fontSize: 18, fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  discussSubtitle:    { fontSize: 13, color: '#64748b', textAlign: 'center' },
  priceRow:           { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  price:              { fontSize: 30, fontWeight: '800', color: '#7c3aed' },
  originalPrice:      { fontSize: 18, color: '#94a3b8', textDecorationLine: 'line-through' },
  priceLabel:         { fontSize: 13, color: '#64748b', marginTop: 2 },
  sectionHead:        { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  description:        { fontSize: 15, color: '#64748b', lineHeight: 24, marginBottom: 20 },
  includedCard:       { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, marginBottom: 20 },
  includedHead:       { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  includedRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  checkmark:          { fontSize: 16, color: '#10b981', fontWeight: '700' },
  includedText:       { fontSize: 14, color: '#64748b' },
  similarSection:     { marginTop: 4 },
  bottomBar:          { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 10 },
  bottomLabel:        { fontSize: 12, color: '#64748b' },
  bottomPrice:        { fontSize: 22, fontWeight: '800', color: '#7c3aed' },
  bottomDiscuss:      { fontSize: 16, fontWeight: '700', color: '#1e40af' },
  bookBtn:            { backgroundColor: '#7c3aed', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  bookBtnText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
});
