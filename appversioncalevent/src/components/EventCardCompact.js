import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from './ui/Badge';

export const EventCardCompact = ({ event, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <Image source={{ uri: event.eventImage }} style={styles.image} resizeMode="cover" />
    <View style={styles.body}>
      <Badge style={styles.badge}>{event.category || 'Event'}</Badge>
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
  card:       { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 12 },
  image:      { width: 120, height: 120 },
  body:       { flex: 1, padding: 12, justifyContent: 'space-between' },
  badge:      { marginBottom: 6 },
  title:      { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  provider:   { fontSize: 12, color: '#64748b', marginBottom: 6 },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price:      { fontSize: 16, fontWeight: '800', color: '#7c3aed' },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#ca8a04' },
});
