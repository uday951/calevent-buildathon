import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from './ui/Badge';

export const EventCard = ({ event, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.imageWrap}>
      <Image source={{ uri: event.eventImage }} style={styles.image} resizeMode="cover" />
      <View style={styles.badgeWrap}>
        <Badge>{event.category || 'Event'}</Badge>
      </View>
    </View>
    <View style={styles.body}>
      <Text style={styles.title} numberOfLines={1}>{event.title || ''}</Text>
      <Text style={styles.provider} numberOfLines={1}>{event.providerId?.businessName || 'Verified Provider'}</Text>
      <View style={styles.footer}>
        <Text style={styles.price}>₹{(event.price || 0).toLocaleString('en-IN')}</Text>
        <View style={styles.ratingRow}>
          <Text>⭐</Text>
          <Text style={styles.ratingText}>{event.rating || '4.5'}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card:       { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', minWidth: 280, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  imageWrap:  { position: 'relative' },
  image:      { width: '100%', height: 180 },
  badgeWrap:  { position: 'absolute', top: 12, left: 12 },
  body:       { padding: 14 },
  title:      { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 3 },
  provider:   { fontSize: 13, color: '#64748b', marginBottom: 10 },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  price:      { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fef9c3', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#ca8a04' },
});
