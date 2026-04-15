import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, RefreshControl, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  pending:            { label: 'Pending Review',    emoji: '⏳', color: '#fef9c3', text: '#a16207',  dot: '#f59e0b' },
  contacted:          { label: 'Team Contacted',    emoji: '📞', color: '#dbeafe', text: '#1d4ed8',  dot: '#3b82f6' },
  providers_assigned: { label: 'Provider Assigned', emoji: '🏢', color: '#e0e7ff', text: '#4338ca',  dot: '#6366f1' },
  quoted:             { label: 'Quote Ready',       emoji: '💰', color: '#f3e8ff', text: '#7c3aed',  dot: '#a855f7' },
  approved:           { label: 'Confirmed',         emoji: '✅', color: '#dcfce7', text: '#15803d',  dot: '#22c55e' },
  in_progress:        { label: 'In Progress',       emoji: '🔧', color: '#ccfbf1', text: '#0f766e',  dot: '#14b8a6' },
  completed:          { label: 'Completed',         emoji: '🎉', color: '#d1fae5', text: '#065f46',  dot: '#10b981' },
  cancelled:          { label: 'Cancelled',         emoji: '❌', color: '#fee2e2', text: '#b91c1c',  dot: '#ef4444' },
};

const TIMELINE_STEPS = ['pending', 'contacted', 'providers_assigned', 'quoted', 'approved', 'in_progress', 'completed'];

const stepsDone = (status) => {
  const idx = TIMELINE_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx + 1;
};

/* ── Ticket card ── */
const RequestCard = ({ item: r }) => {
  const st       = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
  const assigned = r.assignments?.filter(a => a.providerId) || [];
  const done     = stepsDone(r.status);
  const total    = TIMELINE_STEPS.length;
  const progress = done / total;

  return (
    <View style={styles.ticket}>
      {/* Ticket header band */}
      <View style={[styles.ticketBand, { backgroundColor: st.color }]}>
        <View style={styles.ticketBandLeft}>
          <Text style={styles.statusEmoji}>{st.emoji}</Text>
          <View>
            <Text style={[styles.statusLabel, { color: st.text }]}>{st.label}</Text>
            <Text style={styles.reqNum}>{r.requestNumber}</Text>
          </View>
        </View>
        <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
      </View>

      {/* Ticket body */}
      <View style={styles.ticketBody}>
        {/* Title */}
        <Text style={styles.ticketTitle} numberOfLines={1}>
          {r.eventTitle || r.eventType} Event
        </Text>

        {/* Perforated divider */}
        <View style={styles.perfRow}>
          <View style={styles.perfCircleL} />
          <View style={styles.dashLine} />
          <View style={styles.perfCircleR} />
        </View>

        {/* Details grid */}
        <View style={styles.detailGrid}>
          <View style={styles.detailCell}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailVal}>
              {r.eventDate
                ? new Date(r.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailCell}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailLabel}>City</Text>
            <Text style={styles.detailVal}>{r.location?.city || '—'}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailCell}>
            <Text style={styles.detailIcon}>👥</Text>
            <Text style={styles.detailLabel}>Guests</Text>
            <Text style={styles.detailVal}>{r.guestCount || '—'}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailCell}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={styles.detailLabel}>Budget</Text>
            <Text style={styles.detailVal}>
              {r.budget?.max ? `₹${r.budget.max.toLocaleString('en-IN')}` : '—'}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: st.dot }]} />
          </View>
          <View style={styles.progressSteps}>
            {TIMELINE_STEPS.map((step, i) => (
              <View
                key={step}
                style={[
                  styles.progressStep,
                  i < done && { backgroundColor: st.dot },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Services chips */}
        {r.servicesRequired?.length > 0 && (
          <View style={styles.chipsRow}>
            {r.servicesRequired.slice(0, 4).map(s => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
            {r.servicesRequired.length > 4 && (
              <View style={[styles.chip, styles.chipMore]}>
                <Text style={[styles.chipText, { color: '#7c3aed' }]}>+{r.servicesRequired.length - 4}</Text>
              </View>
            )}
          </View>
        )}

        {/* Assigned providers */}
        {assigned.length > 0 && (
          <View style={styles.providerBox}>
            <Text style={styles.providerBoxTitle}>👷 Assigned Providers</Text>
            {assigned.map((a, idx) => (
              <View key={idx} style={styles.providerRow}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerAvatarText}>
                    {(a.providerId?.businessName || 'P').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{a.providerId?.businessName || a.providerId?.name}</Text>
                  {a.serviceType && <Text style={styles.providerService}>{a.serviceType}</Text>}
                </View>
                <View style={[styles.verifiedBadge]}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pending notice */}
        {assigned.length === 0 && r.status === 'pending' && (
          <View style={styles.pendingNotice}>
            <Text style={styles.pendingNoticeIcon}>⏱</Text>
            <Text style={styles.pendingNoticeText}>
              Our team will review and contact you within 24 hours.
            </Text>
          </View>
        )}

        {/* Quotation */}
        {r.quotation?.totalAmount && (
          <View style={styles.quotationBox}>
            <View style={styles.quotationLeft}>
              <Text style={styles.quotationLabel}>💰 Your Quotation</Text>
              <Text style={styles.quotationAmount}>
                ₹{r.quotation.totalAmount.toLocaleString('en-IN')}
              </Text>
              {r.quotation.notes && <Text style={styles.quotationNotes}>{r.quotation.notes}</Text>}
            </View>
            <TouchableOpacity style={styles.quotationBtn}>
              <Text style={styles.quotationBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Admin notes */}
        {r.adminNotes && (
          <View style={styles.adminBox}>
            <Text style={styles.adminBoxTitle}>📢 Note from team</Text>
            <Text style={styles.adminBoxText}>{r.adminNotes}</Text>
          </View>
        )}

        {/* Footer timestamp */}
        <Text style={styles.submittedAt}>
          Submitted {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>

      {/* Ticket bottom barcode-ish strip */}
      <View style={styles.ticketFooter}>
        <View style={styles.barcodeStrip}>
          {Array(20).fill(0).map((_, i) => (
            <View key={i} style={[styles.barLine, { height: i % 3 === 0 ? 16 : 10, opacity: i % 4 === 0 ? 0.25 : 0.1 }]} />
          ))}
        </View>
        <Text style={styles.barcodeId}>{r.requestNumber || 'CAL-XXXX'}</Text>
      </View>
    </View>
  );
};

export const MyRequestsScreen = ({ navigation }) => {
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) { setIsLoggedIn(false); setLoading(false); setRefreshing(false); return; }
      setIsLoggedIn(true);
      const res  = await api.get('/event-requests/my');
      const data = res.data?.data?.requests || [];
      setRequests(data);
    } catch (err) {
      console.error('Fetch requests error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchRequests(); }, [fetchRequests]));

  const onRefresh = () => { setRefreshing(true); fetchRequests(); };

  /* ── Not logged in ── */
  if (!isLoggedIn && !loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>My Requests</Text>
          <Text style={styles.heroSub}>Track your event plans</Text>
        </View>
        <View style={styles.guestWrap}>
          <View style={styles.guestIconWrap}>
            <Text style={{ fontSize: 48 }}>📋</Text>
          </View>
          <Text style={styles.guestTitle}>Login to view your requests</Text>
          <Text style={styles.guestSub}>Track your event planning requests and team updates in one place.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroTitle}>My Requests</Text>
            <Text style={styles.heroSub}>Track your event journey</Text>
          </View>
          <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('PlanMyEvent')}>
            <Text style={styles.newBtnText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { label: 'Total',     value: requests.length },
            { label: 'Active',    value: requests.filter(r => !['completed','cancelled'].includes(r.status)).length },
            { label: 'Done',      value: requests.filter(r => r.status === 'completed').length },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 48 }} size="large" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          renderItem={({ item }) => <RequestCard item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 56, marginBottom: 14 }}>🎪</Text>
              <Text style={styles.emptyTitle}>No requests yet</Text>
              <Text style={styles.emptySub}>Start planning your perfect event with CALEVENT</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('PlanMyEvent')}>
                <Text style={styles.loginBtnText}>Plan My Event</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#f0f0f5' },

  /* Header */
  heroHeader: { backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 26, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  heroRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  heroTitle:  { fontSize: 26, fontWeight: '800', color: '#fff' },
  heroSub:    { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  newBtn:     { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  /* Stats strip */
  statsStrip:  { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, overflow: 'hidden' },
  statItem:    { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBorder:  { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.25)' },
  statVal:     { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLbl:     { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  /* List */
  list:        { padding: 16, paddingBottom: 40, gap: 20 },

  /* ── Ticket ── */
  ticket:      { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5 },

  ticketBand:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  ticketBandLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusEmoji: { fontSize: 22 },
  statusLabel: { fontSize: 13, fontWeight: '800' },
  reqNum:      { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginTop: 1 },
  statusDot:   { width: 10, height: 10, borderRadius: 5 },

  ticketBody: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },

  ticketTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12 },

  /* Perforated divider */
  perfRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  perfCircleL:{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#f0f0f5', marginLeft: -25 },
  dashLine:   { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e2e8f0', marginHorizontal: 4 },
  perfCircleR:{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#f0f0f5', marginRight: -25 },

  /* Detail grid */
  detailGrid:   { flexDirection: 'row', marginBottom: 14 },
  detailCell:   { flex: 1, alignItems: 'center' },
  detailDivider:{ width: 1, backgroundColor: '#f1f5f9' },
  detailIcon:   { fontSize: 16, marginBottom: 2 },
  detailLabel:  { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginBottom: 2 },
  detailVal:    { fontSize: 12, fontWeight: '700', color: '#0f172a', textAlign: 'center' },

  /* Progress */
  progressSection:  { marginBottom: 12 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel:    { fontSize: 11, color: '#64748b', fontWeight: '600' },
  progressPct:      { fontSize: 11, fontWeight: '800', color: '#7c3aed' },
  progressTrack:    { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginBottom: 6 },
  progressFill:     { height: 6, borderRadius: 3 },
  progressSteps:    { flexDirection: 'row', gap: 4 },
  progressStep:     { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#e2e8f0' },

  /* Chips */
  chipsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip:       { backgroundColor: '#ede9fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText:   { fontSize: 11, color: '#7c3aed', fontWeight: '700', textTransform: 'capitalize' },
  chipMore:   { backgroundColor: '#f3f4f6' },

  /* Provider box */
  providerBox:      { backgroundColor: '#f5f3ff', borderRadius: 12, padding: 14, marginBottom: 10 },
  providerBoxTitle: { fontSize: 12, fontWeight: '800', color: '#5b21b6', marginBottom: 10 },
  providerRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  providerAvatar:   { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  providerAvatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  providerName:     { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  providerService:  { fontSize: 11, color: '#64748b', textTransform: 'capitalize' },
  verifiedBadge:    { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  verifiedText:     { fontSize: 10, color: '#15803d', fontWeight: '700' },

  /* Pending notice */
  pendingNotice:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef9c3', borderRadius: 10, padding: 12, marginBottom: 10 },
  pendingNoticeIcon: { fontSize: 18 },
  pendingNoticeText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },

  /* Quotation */
  quotationBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f3ff', borderRadius: 12, padding: 14, marginBottom: 10 },
  quotationLeft:  { flex: 1 },
  quotationLabel: { fontSize: 12, fontWeight: '700', color: '#7c3aed', marginBottom: 2 },
  quotationAmount:{ fontSize: 22, fontWeight: '800', color: '#5b21b6' },
  quotationNotes: { fontSize: 11, color: '#64748b', marginTop: 2 },
  quotationBtn:   { backgroundColor: '#7c3aed', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  quotationBtnText:{ color: '#fff', fontWeight: '700', fontSize: 13 },

  /* Admin notes */
  adminBox:      { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, marginBottom: 10 },
  adminBoxTitle: { fontSize: 12, fontWeight: '800', color: '#1d4ed8', marginBottom: 4 },
  adminBoxText:  { fontSize: 12, color: '#1e40af', lineHeight: 18 },

  submittedAt: { fontSize: 10, color: '#94a3b8', marginTop: 4 },

  /* Barcode footer */
  ticketFooter: { backgroundColor: '#f8fafc', paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  barcodeStrip: { flexDirection: 'row', gap: 3, marginBottom: 4, alignItems: 'center' },
  barLine:      { width: 3, backgroundColor: '#94a3b8', borderRadius: 1 },
  barcodeId:    { fontSize: 10, color: '#94a3b8', fontWeight: '600', letterSpacing: 2 },

  /* Empty / guest */
  emptyWrap:   { alignItems: 'center', paddingVertical: 60 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: '#475569', marginBottom: 8 },
  emptySub:    { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 32, marginBottom: 24 },
  guestWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  guestIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  guestTitle:  { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 10, textAlign: 'center' },
  guestSub:    { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginBtn:    { backgroundColor: '#7c3aed', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center' },
  loginBtnText:{ color: '#fff', fontWeight: '700', fontSize: 16 },
});
