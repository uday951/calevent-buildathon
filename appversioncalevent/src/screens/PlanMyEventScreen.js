import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const EVENT_TYPES = [
  { id: 'wedding',     label: 'Wedding',     icon: '💒' },
  { id: 'birthday',    label: 'Birthday',    icon: '🎂' },
  { id: 'corporate',   label: 'Corporate',   icon: '🏢' },
  { id: 'anniversary', label: 'Anniversary', icon: '💕' },
  { id: 'conference',  label: 'Conference',  icon: '🎤' },
  { id: 'party',       label: 'Party',       icon: '🎉' },
];

const SERVICES = [
  { id: 'venue',       label: 'Venue',        icon: '🏛️' },
  { id: 'catering',    label: 'Catering',     icon: '🍽️' },
  { id: 'decoration',  label: 'Decoration',   icon: '🌸' },
  { id: 'photography', label: 'Photography',  icon: '📸' },
  { id: 'videography', label: 'Videography',  icon: '🎥' },
  { id: 'lighting',    label: 'Lighting',     icon: '💡' },
  { id: 'sound',       label: 'Sound System', icon: '🔊' },
  { id: 'dj',          label: 'DJ',           icon: '🎧' },
  { id: 'stage',       label: 'Stage Setup',  icon: '🎭' },
  { id: 'cake',        label: 'Cake',         icon: '🎂' },
  { id: 'flowers',     label: 'Flowers',      icon: '💐' },
  { id: 'transport',   label: 'Transport',    icon: '🚌' },
];

const STEPS = ['Event Type', 'Details', 'Services', 'Review'];

export const PlanMyEventScreen = ({ navigation, route }) => {
  const [step, setStep] = useState(route?.params?.eventType ? 1 : 0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    eventType: route?.params?.eventType || '',
    eventTitle: route?.params?.eventTitle || '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    address: '',
    city: '',
    state: '',
    budgetMin: '',
    budgetMax: '',
    servicesRequired: [],
    description: '',
    specialRequirements: '',
    contactPreference: 'phone',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleService = (id) => setForm(f => ({
    ...f,
    servicesRequired: f.servicesRequired.includes(id)
      ? f.servicesRequired.filter(s => s !== id)
      : [...f.servicesRequired, id],
  }));

  const canNext = () => {
    if (step === 0) return !!form.eventType;
    if (step === 1) return form.eventDate && form.guestCount && form.city && form.address && form.budgetMax;
    if (step === 2) return form.servicesRequired.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (!token) {
      Alert.alert('Login Required', 'Please login to submit an event request', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        eventType: form.eventType,
        eventTitle: form.eventTitle,
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        guestCount: parseInt(form.guestCount),
        location: { address: form.address, city: form.city, state: form.state },
        budget: { min: parseInt(form.budgetMin) || 0, max: parseInt(form.budgetMax) },
        servicesRequired: form.servicesRequired,
        description: form.description,
        specialRequirements: form.specialRequirements,
        contactPreference: form.contactPreference,
      };

      await api.post('/event-requests', payload);
      Alert.alert(
        '🎉 Request Sent!',
        "Our team will review your request and contact you within 24 hours with a custom quote.",
        [{ text: 'Track Request', onPress: () => navigation.replace('MyRequests') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inp = (key, placeholder, keyboard = 'default', multiline = false) => (
    <TextInput
      style={[styles.input, multiline && styles.inputMulti]}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={form[key]}
      onChangeText={v => set(key, v)}
      keyboardType={keyboard}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan My Event</Text>
        <Text style={styles.stepCount}>{step + 1}/{STEPS.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
      </View>

      {/* Step labels */}
      <View style={styles.stepsRow}>
        {STEPS.map((s, i) => (
          <Text key={i} style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Step 0 — Event Type */}
          {step === 0 && (
            <View>
              <Text style={styles.stepTitle}>What type of event are you planning?</Text>
              <View style={styles.typeGrid}>
                {EVENT_TYPES.map(et => (
                  <TouchableOpacity
                    key={et.id}
                    style={[styles.typeCard, form.eventType === et.id && styles.typeCardActive]}
                    onPress={() => set('eventType', et.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.typeIcon}>{et.icon}</Text>
                    <Text style={[styles.typeLabel, form.eventType === et.id && styles.typeLabelActive]}>{et.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <View style={styles.formSection}>
              <Text style={styles.stepTitle}>Event Details</Text>
              <Text style={styles.fieldLabel}>Event Title (optional)</Text>
              {inp('eventTitle', 'e.g. Priya & Rahul\'s Wedding')}
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>Event Date *</Text>
                  {inp('eventDate', 'YYYY-MM-DD')}
                </View>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>Event Time</Text>
                  {inp('eventTime', 'e.g. 6:00 PM')}
                </View>
              </View>
              <Text style={styles.fieldLabel}>Expected Guests *</Text>
              {inp('guestCount', 'e.g. 200', 'numeric')}
              <Text style={styles.fieldLabel}>Event Address *</Text>
              {inp('address', 'Full address')}
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>City *</Text>
                  {inp('city', 'City')}
                </View>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>State</Text>
                  {inp('state', 'State')}
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>Min Budget (₹)</Text>
                  {inp('budgetMin', '50,000', 'numeric')}
                </View>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>Max Budget (₹) *</Text>
                  {inp('budgetMax', '5,00,000', 'numeric')}
                </View>
              </View>
              <Text style={styles.fieldLabel}>Contact Preference</Text>
              <View style={styles.contactRow}>
                {['phone', 'email', 'whatsapp'].map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.contactBtn, form.contactPreference === c && styles.contactBtnActive]}
                    onPress={() => set('contactPreference', c)}
                  >
                    <Text style={[styles.contactBtnText, form.contactPreference === c && styles.contactBtnTextActive]}>
                      {c === 'phone' ? '📞' : c === 'email' ? '📧' : '💬'} {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 2 — Services */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>What services do you need?</Text>
              <Text style={styles.stepSub}>Select all that apply</Text>
              <View style={styles.servicesGrid}>
                {SERVICES.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.serviceCard, form.servicesRequired.includes(s.id) && styles.serviceCardActive]}
                    onPress={() => toggleService(s.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.serviceIcon}>{s.icon}</Text>
                    <Text style={[styles.serviceLabel, form.servicesRequired.includes(s.id) && styles.serviceLabelActive]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Describe your vision (optional)</Text>
              {inp('description', 'Tell us more about what you have in mind...', 'default', true)}
              <Text style={styles.fieldLabel}>Special Requirements (optional)</Text>
              {inp('specialRequirements', 'Any specific requirements...', 'default', true)}
            </View>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Review Your Request</Text>
              {[
                ['Event Type',  EVENT_TYPES.find(e => e.id === form.eventType)?.label],
                form.eventTitle && ['Title', form.eventTitle],
                ['Date',        form.eventDate],
                form.eventTime && ['Time', form.eventTime],
                ['Guests',      `${form.guestCount} people`],
                ['Location',    `${form.address}, ${form.city}`],
                ['Budget',      `₹${parseInt(form.budgetMin || 0).toLocaleString()} – ₹${parseInt(form.budgetMax).toLocaleString()}`],
                ['Services',    form.servicesRequired.join(', ')],
                ['Contact via', form.contactPreference],
              ].filter(Boolean).map(([label, value]) => (
                <View key={label} style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>{label}</Text>
                  <Text style={styles.reviewValue}>{value || '—'}</Text>
                </View>
              ))}
              <View style={styles.reviewNote}>
                <Text style={styles.reviewNoteText}>
                  🎯 After submission, our team will review your request and contact you within 24 hours with a customized quote.
                </Text>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
            onPress={() => setStep(s => s + 1)}
            disabled={!canNext()}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Continue →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, submitting && styles.nextBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>🚀 Submit Request</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#f8fafc' },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn:            { fontSize: 15, color: '#7c3aed', fontWeight: '600' },
  headerTitle:        { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  stepCount:          { fontSize: 13, color: '#64748b', fontWeight: '600' },
  progressBg:         { height: 4, backgroundColor: '#e2e8f0' },
  progressFill:       { height: 4, backgroundColor: '#7c3aed', borderRadius: 2 },
  stepsRow:           { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  stepLabel:          { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  stepLabelActive:    { color: '#7c3aed', fontWeight: '700' },
  scroll:             { padding: 16, paddingBottom: 32 },
  stepTitle:          { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  stepSub:            { fontSize: 13, color: '#64748b', marginBottom: 16 },
  typeGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  typeCard:           { width: '30%', aspectRatio: 1, borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 6 },
  typeCardActive:     { borderColor: '#7c3aed', backgroundColor: '#f3e8ff' },
  typeIcon:           { fontSize: 28 },
  typeLabel:          { fontSize: 12, fontWeight: '600', color: '#64748b', textAlign: 'center' },
  typeLabelActive:    { color: '#7c3aed' },
  formSection:        { gap: 4 },
  fieldLabel:         { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 6 },
  input:              { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 14, color: '#0f172a' },
  inputMulti:         { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  row:                { flexDirection: 'row', gap: 12 },
  half:               { flex: 1 },
  contactRow:         { flexDirection: 'row', gap: 8, marginTop: 4 },
  contactBtn:         { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#fff' },
  contactBtnActive:   { borderColor: '#7c3aed', backgroundColor: '#f3e8ff' },
  contactBtnText:     { fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'capitalize' },
  contactBtnTextActive:{ color: '#7c3aed' },
  servicesGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12, marginBottom: 20 },
  serviceCard:        { width: '30%', paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: '#e2e8f0', backgroundColor: '#fff', alignItems: 'center', gap: 4 },
  serviceCardActive:  { borderColor: '#7c3aed', backgroundColor: '#f3e8ff' },
  serviceIcon:        { fontSize: 22 },
  serviceLabel:       { fontSize: 11, fontWeight: '600', color: '#64748b', textAlign: 'center' },
  serviceLabelActive: { color: '#7c3aed' },
  reviewRow:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  reviewLabel:        { fontSize: 13, fontWeight: '600', color: '#64748b', width: 100 },
  reviewValue:        { fontSize: 13, color: '#0f172a', fontWeight: '500', flex: 1, textAlign: 'right' },
  reviewNote:         { backgroundColor: '#f3e8ff', borderRadius: 14, padding: 14, marginTop: 16 },
  reviewNoteText:     { fontSize: 13, color: '#7c3aed', lineHeight: 20 },
  bottomBar:          { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  nextBtn:            { backgroundColor: '#7c3aed', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  nextBtnDisabled:    { opacity: 0.4 },
  nextBtnText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
});
