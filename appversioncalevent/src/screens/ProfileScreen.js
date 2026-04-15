import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  TextInput, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const { width } = Dimensions.get('window');

const MENU_SECTIONS = [
  {
    title: 'My Activity',
    items: [
      { id: 1, icon: '📋', label: 'My Bookings',     screen: 'Bookings',   desc: 'View all event bookings' },
      { id: 2, icon: '🎯', label: 'My Requests',     screen: 'MyRequests', desc: 'Track event requests' },
      { id: 3, icon: '❤️', label: 'Saved Events',    screen: 'Explore',    desc: 'Your wishlist' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 4, icon: '💳', label: 'Payment Methods',  screen: null, desc: 'Cards & UPI' },
      { id: 5, icon: '🔔', label: 'Notifications',    screen: null, desc: 'Alerts & reminders' },
      { id: 6, icon: '🔒', label: 'Privacy & Security', screen: null, desc: 'Manage data & security' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 7, icon: '❓', label: 'Help & Support',   screen: null, desc: 'FAQs & contact us' },
      { id: 8, icon: '⭐', label: 'Rate the App',     screen: null, desc: 'Share your experience' },
    ],
  },
];

const AVATAR_COLORS = ['#7c3aed', '#be185d', '#1d4ed8', '#047857', '#b45309'];

export const ProfileScreen = ({ navigation }) => {
  const [user,      setUser]      = useState(null);
  const [stats,     setStats]     = useState({ totalBookings: 0, upcomingEvents: 0, completedBookings: 0 });
  const [loading,   setLoading]   = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState({ name: '', phone: '', address: '' });
  const logout = useAuthStore(s => s.logout);

  const loadProfile = useCallback(async () => {
    try {
      const token    = await AsyncStorage.getItem('@auth_token');
      const userData = await AsyncStorage.getItem('@user_data');
      if (!token || !userData) { setLoading(false); return; }
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setForm({ name: parsed.name || '', phone: parsed.phone || '', address: parsed.address || '' });

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
      const res     = await api.put('/customer/profile', form);
      const updated = res.data?.data || res.data;
      if (updated) { setUser(updated); await AsyncStorage.setItem('@user_data', JSON.stringify(updated)); }
      setIsEditing(false);
      Alert.alert('✅ Updated', 'Your profile has been saved.');
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
        await logout();
      }},
    ]);
  };

  const initials = (name) => (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  /* Avatar colour based on name */
  const avatarColor = AVATAR_COLORS[(user?.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  if (loading) return <View style={styles.center}><ActivityIndicator color="#7c3aed" size="large" /></View>;

  /* ── Guest view ── */
  if (!user) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.heroHeader}>
        <Text style={styles.heroTitle}>Profile</Text>
        <Text style={styles.heroSub}>Your CALEVENT account</Text>
      </View>
      <View style={styles.guestWrap}>
        <View style={[styles.guestAvatarWrap, { backgroundColor: '#f3e8ff' }]}>
          <Text style={{ fontSize: 48 }}>👤</Text>
        </View>
        <Text style={styles.guestTitle}>You're not logged in</Text>
        <Text style={styles.guestSub}>Login to manage your profile, bookings and event requests.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Login as Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroRow}>
            <Text style={styles.heroTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
            >
              <Text style={styles.editBtnText}>{saving ? '⏳ Saving' : isEditing ? '✓ Save' : '✏️ Edit'}</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar + user info */}
          <View style={styles.profileCard}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials(user.name)}</Text>
            </View>
            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={form.name}
                  onChangeText={v => setForm(f => ({ ...f, name: v }))}
                  placeholder="Your name"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                />
              ) : (
                <Text style={styles.profileName}>{user.name || 'User'}</Text>
              )}
              <Text style={styles.profileEmail}>{user.email}</Text>
              {user.phone ? <Text style={styles.profilePhone}>📞 {user.phone}</Text> : null}
            </View>
          </View>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsWrap}>
          <View style={styles.statsCard}>
            {[
              { label: 'Bookings',  value: stats.totalBookings    || 0, icon: '📋', color: '#7c3aed' },
              { label: 'Upcoming',  value: stats.upcomingEvents   || 0, icon: '📅', color: '#1d4ed8' },
              { label: 'Completed', value: stats.completedBookings|| 0, icon: '🎉', color: '#047857' },
            ].map((s, i) => (
              <View key={i} style={[styles.statCell, i < 2 && styles.statBorder]}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Edit Form ── */}
        {isEditing && (
          <View style={styles.editFormWrap}>
            <Text style={styles.editFormTitle}>Edit Profile</Text>
            {[
              { key: 'phone',   label: 'Phone Number', placeholder: '+91 XXXXX XXXXX', kb: 'phone-pad' },
              { key: 'address', label: 'Address',       placeholder: 'Enter your address',    kb: 'default' },
            ].map(field => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94a3b8"
                  keyboardType={field.kb}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Menu sections ── */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuRow, i < section.items.length - 1 && styles.menuBorder]}
                  activeOpacity={0.7}
                  onPress={() => item.screen && navigation.navigate(item.screen)}
                >
                  <View style={styles.menuIconWrap}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuDesc}>{item.desc}</Text>
                  </View>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout ── */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>🚪  Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>CALEVENT</Text>
          <Text style={styles.footerMeta}>Version 1.0.0  ·  © 2026 CALEVENT</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: '#f0f0f5' },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  /* Hero */
  heroHeader:  { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heroTitle:   { fontSize: 26, fontWeight: '800', color: '#fff' },
  heroSub:     { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  editBtn:     { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  /* Profile card */
  profileCard:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar:       { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText:   { fontSize: 28, fontWeight: '800', color: '#fff' },
  profileInfo:  { flex: 1 },
  profileName:  { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 3 },
  nameInput:    { fontSize: 18, fontWeight: '700', color: '#fff', borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,255,255,0.5)', paddingBottom: 4, marginBottom: 4 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  profilePhone: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },

  /* Stats */
  statsWrap:  { paddingHorizontal: 16, marginTop: -22 },
  statsCard:  { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 5 },
  statCell:   { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statBorder: { borderRightWidth: 1, borderRightColor: '#f1f5f9' },
  statIcon:   { fontSize: 20, marginBottom: 4 },
  statValue:  { fontSize: 22, fontWeight: '800', marginBottom: 3 },
  statLabel:  { fontSize: 11, color: '#94a3b8', fontWeight: '500' },

  /* Edit form */
  editFormWrap:  { margin: 16, backgroundColor: '#fff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  editFormTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  fieldWrap:     { marginBottom: 14 },
  fieldLabel:    { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  fieldInput:    { backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, color: '#0f172a' },
  cancelBtn:     { alignItems: 'center', paddingVertical: 10, marginTop: 6 },
  cancelBtnText: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  /* Menu sections */
  menuSection:      { paddingHorizontal: 16, marginTop: 16 },
  menuSectionTitle: { fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  menuCard:         { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuRow:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuBorder:       { borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  menuIconWrap:     { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuIcon:         { fontSize: 20 },
  menuTextWrap:     { flex: 1 },
  menuLabel:        { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  menuDesc:         { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  menuArrow:        { fontSize: 22, color: '#cbd5e1' },

  /* Logout */
  logoutSection: { paddingHorizontal: 16, marginTop: 20 },
  logoutBtn:     { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#fee2e2', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  logoutBtnText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },

  /* Footer */
  footer:      { alignItems: 'center', paddingVertical: 32, gap: 4 },
  footerBrand: { fontSize: 14, fontWeight: '800', color: '#7c3aed' },
  footerMeta:  { fontSize: 11, color: '#94a3b8' },

  /* Guest */
  guestWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 40 },
  guestAvatarWrap:{ width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  guestTitle:     { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 10, textAlign: 'center' },
  guestSub:       { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginBtn:       { backgroundColor: '#7c3aed', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 12 },
  loginBtnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
  registerBtn:    { borderWidth: 1.5, borderColor: '#7c3aed', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center' },
  registerBtnText:{ color: '#7c3aed', fontWeight: '700', fontSize: 16 },
});
