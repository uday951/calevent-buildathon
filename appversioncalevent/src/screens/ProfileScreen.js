import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const menuItems = [
  { id: 1, emoji: '📋', label: 'My Bookings',      screen: 'Bookings' },
  { id: 2, emoji: '❤️', label: 'Saved Events',      screen: 'Explore' },
  { id: 3, emoji: '💳', label: 'Payment Methods',   screen: null },
  { id: 4, emoji: '🔔', label: 'Notifications',     screen: null },
  { id: 5, emoji: '❓', label: 'Help & Support',    screen: null },
];

export const ProfileScreen = ({ navigation }) => {
  const [user,      setUser]      = useState(null);
  const [stats,     setStats]     = useState({ totalBookings: 0, upcomingEvents: 0, completedBookings: 0 });
  const [loading,   setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState({ name: '', phone: '', address: '' });

  const loadProfile = useCallback(async () => {
    try {
      const token    = await AsyncStorage.getItem('@auth_token');
      const userData = await AsyncStorage.getItem('@user_data');
      if (!token || !userData) { setLoading(false); return; }
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setForm({ name: parsed.name || '', phone: parsed.phone || '', address: parsed.address || '' });

      // Fetch fresh profile + stats
      const [profileRes, statsRes] = await Promise.allSettled([
        api.get('/customer/profile'),
        api.get('/customer/stats'),
      ]);
      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value.data?.data || profileRes.value.data;
        if (p) { setUser(p); setForm({ name: p.name || '', phone: p.phone || '', address: p.address || '' }); }
      }
      if (statsRes.status === 'fulfilled') {
        const s = statsRes.value.data?.data || statsRes.value.data;
        if (s) setStats(s);
      }
    } catch {
      // use cached data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/customer/profile', form);
      const updated = res.data?.data || res.data;
      if (updated) {
        setUser(updated);
        await AsyncStorage.setItem('@user_data', JSON.stringify(updated));
      }
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
        setUser(null);
        setStats({ totalBookings: 0, upcomingEvents: 0, completedBookings: 0 });
      }},
    ]);
  };

  const initials = (name) => (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#7c3aed" size="large" /></View>;

  // Not logged in
  if (!user) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.guestWrap}>
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={styles.guestTitle}>You're not logged in</Text>
        <Text style={styles.guestSub}>Login to view your profile, bookings and more</Text>
        <TouchableOpacity style={styles.loginBtn} activeOpacity={0.85}>
          <Text style={styles.loginBtnText}>Login as Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} activeOpacity={0.85}>
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBg}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.editBtn} disabled={saving}>
              <Text style={styles.editBtnText}>{saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(user.name)}</Text>
            </View>
            {isEditing ? (
              <TextInput style={styles.nameInput} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Your name" placeholderTextColor="rgba(255,255,255,0.6)" />
            ) : (
              <Text style={styles.name}>{user.name || 'User'}</Text>
            )}
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsWrap}>
          <View style={styles.statsCard}>
            {[
              { label: 'Bookings',   value: stats.totalBookings || 0 },
              { label: 'Upcoming',   value: stats.upcomingEvents || 0 },
              { label: 'Completed',  value: stats.completedBookings || 0 },
            ].map((s, i) => (
              <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Edit Form */}
        {isEditing && (
          <View style={styles.editForm}>
            <Text style={styles.editFormTitle}>Edit Profile</Text>
            {[
              { key: 'phone',   label: 'Phone Number', placeholder: '+91 XXXXX XXXXX', keyboard: 'phone-pad' },
              { key: 'address', label: 'Address',       placeholder: 'Enter your address', keyboard: 'default' },
            ].map(field => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94a3b8"
                  keyboardType={field.keyboard}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelEditBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contact Info */}
        {!isEditing && (user.phone || user.address) && (
          <View style={styles.contactCard}>
            {user.phone   && <View style={styles.contactRow}><Text style={styles.contactIcon}>📞</Text><Text style={styles.contactText}>{user.phone}</Text></View>}
            {user.address && <View style={styles.contactRow}><Text style={styles.contactIcon}>📍</Text><Text style={styles.contactText}>{user.address}</Text></View>}
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuWrap}>
          <View style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuRow, i < menuItems.length - 1 && styles.menuBorder]}
                activeOpacity={0.7}
                onPress={() => item.screen && navigation.navigate(item.screen)}
              >
                <View style={styles.menuLeft}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.menuRow]} activeOpacity={0.7} onPress={handleLogout}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuEmoji}>🚪</Text>
                <Text style={[styles.menuLabel, styles.logoutText]}>Logout</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2026 CALEVENT. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#f8fafc' },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBg:        { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle:     { fontSize: 28, fontWeight: '800', color: '#fff' },
  editBtn:         { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  editBtnText:     { color: '#fff', fontWeight: '700', fontSize: 14 },
  avatarSection:   { alignItems: 'center' },
  avatar:          { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:      { fontSize: 32, fontWeight: '800', color: '#7c3aed' },
  name:            { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  nameInput:       { fontSize: 20, fontWeight: '700', color: '#fff', borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,255,255,0.5)', paddingBottom: 4, marginBottom: 4, textAlign: 'center', minWidth: 200 },
  email:           { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  statsWrap:       { paddingHorizontal: 16, marginTop: -28 },
  statsCard:       { backgroundColor: '#fff', borderRadius: 20, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  statItem:        { flex: 1, alignItems: 'center', paddingVertical: 20 },
  statBorder:      { borderRightWidth: 1, borderRightColor: '#f1f5f9' },
  statValue:       { fontSize: 24, fontWeight: '800', color: '#7c3aed', marginBottom: 4 },
  statLabel:       { fontSize: 12, color: '#64748b', fontWeight: '500' },
  editForm:        { margin: 16, backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  editFormTitle:   { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 14 },
  fieldWrap:       { marginBottom: 14 },
  fieldLabel:      { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  fieldInput:      { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, height: 46, fontSize: 15, color: '#0f172a' },
  cancelEditBtn:   { alignItems: 'center', paddingVertical: 10 },
  cancelEditBtnText:{ fontSize: 14, color: '#64748b', fontWeight: '600' },
  contactCard:     { marginHorizontal: 16, marginTop: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  contactRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  contactIcon:     { fontSize: 16 },
  contactText:     { fontSize: 14, color: '#64748b' },
  menuWrap:        { paddingHorizontal: 16, marginTop: 16 },
  menuCard:        { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  menuBorder:      { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuLeft:        { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuEmoji:       { fontSize: 22 },
  menuLabel:       { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  logoutText:      { color: '#ef4444' },
  arrow:           { fontSize: 22, color: '#94a3b8' },
  footer:          { alignItems: 'center', paddingVertical: 24, gap: 4 },
  footerText:      { fontSize: 12, color: '#94a3b8' },
  guestWrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestIcon:       { fontSize: 64, marginBottom: 16 },
  guestTitle:      { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  guestSub:        { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 32 },
  loginBtn:        { backgroundColor: '#7c3aed', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 12 },
  loginBtnText:    { color: '#fff', fontWeight: '700', fontSize: 16 },
  registerBtn:     { borderWidth: 1.5, borderColor: '#7c3aed', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center' },
  registerBtnText: { color: '#7c3aed', fontWeight: '700', fontSize: 16 },
});
