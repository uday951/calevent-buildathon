import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

const BookEventScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const passedEvent = route.params?.event;
  const eventId = passedEvent?._id || route.params?.eventId;
  const { token, isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState(passedEvent || null);
  const [loading, setLoading] = useState(!passedEvent);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    eventDate: '',
    guestCount: '',
    venue: '',
    budgetMin: '',
    budgetMax: '',
    specialRequests: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to book events');
      navigation.goBack();
      return;
    }
    if (!passedEvent && eventId) {
      fetchEvent();
    } else if (passedEvent) {
      // Event already passed, set up form
      const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const formattedDate = defaultDate.toISOString().split('T')[0];
      
      setFormData({
        eventDate: formattedDate,
        guestCount: String(passedEvent.minCapacity || ''),
        venue: typeof passedEvent.location === 'object' 
          ? passedEvent.location.city 
          : passedEvent.location || '',
        budgetMin: passedEvent.price > 1 ? String(Math.floor(passedEvent.price * 0.8)) : '',
        budgetMax: passedEvent.price > 1 ? String(Math.ceil(passedEvent.price * 1.2)) : '',
        specialRequests: '',
      });
      setLoading(false);
    }
  }, [eventId, passedEvent, isAuthenticated]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      const evt = response.data.event || response.data.data?.event;
      
      if (evt) {
        setEvent(evt);
        const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const formattedDate = defaultDate.toISOString().split('T')[0];
        
        setFormData({
          eventDate: formattedDate,
          guestCount: String(evt.minCapacity || ''),
          venue: typeof evt.location === 'object' ? evt.location.city : evt.location || '',
          budgetMin: evt.price > 1 ? String(Math.floor(evt.price * 0.8)) : '',
          budgetMax: evt.price > 1 ? String(Math.ceil(evt.price * 1.2)) : '',
          specialRequests: '',
        });
      } else {
        Alert.alert('Error', 'Event not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to load event details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.eventDate || !formData.guestCount || !formData.venue) {
      Alert.alert('Required Fields', 'Please fill event date, guest count, and venue');
      return;
    }

    setSubmitting(true);

    try {
      const eventDateObj = new Date(formData.eventDate);
      
      const requestBody = {
        eventType: event.category,
        eventTitle: event.title,
        eventId: event._id,
        eventDate: eventDateObj.toISOString(),
        guestCount: parseInt(formData.guestCount),
        venue: formData.venue,
        budget: {
          min: parseInt(formData.budgetMin) || 10000,
          max: parseInt(formData.budgetMax) || 50000,
        },
        specialRequests: formData.specialRequests || `Interested in: ${event.title}`,
        status: 'pending',
      };
      
      const response = await api.post('/event-requests', requestBody);

      if (response.data.success) {
        Alert.alert(
          'Success! 🎉',
          response.data.message || 'Booking request submitted! Our team will contact you within 24 hours.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (price <= 1) return '💬 Price will be discussed';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Event</Text>
      </View>

      {/* Event Summary Card */}
      <View style={styles.eventCard}>
        <Image
          source={{ uri: event.eventImage }}
          style={styles.eventImage}
        />
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
        <View style={styles.eventInfoRow}>
          <View style={styles.eventInfoItem}>
            <Text style={styles.eventInfoLabel}>Category</Text>
            <Text style={styles.eventInfoValue}>{event.category}</Text>
          </View>
          <View style={styles.eventInfoItem}>
            <Text style={styles.eventInfoLabel}>Price</Text>
            <Text style={styles.eventInfoValue}>{formatPrice(event.price)}</Text>
          </View>
        </View>
        <View style={styles.eventInfoRow}>
          <View style={styles.eventInfoItem}>
            <Text style={styles.eventInfoLabel}>Capacity</Text>
            <Text style={styles.eventInfoValue}>
              {event.minCapacity}-{event.maxCapacity} guests
            </Text>
          </View>
        </View>
      </View>

      {/* Booking Form */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Booking Details</Text>

        {/* Event Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            📅 Event Date <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.inputField}
            value={formData.eventDate}
            onChangeText={(text) => setFormData({ ...formData, eventDate: text })}
            placeholder="YYYY-MM-DD"
          />
          <Text style={styles.helperText}>Format: YYYY-MM-DD (e.g., 2024-12-25)</Text>
        </View>

        {/* Guest Count */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            👥 Number of Guests <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.inputField}
            value={formData.guestCount}
            onChangeText={(text) => setFormData({ ...formData, guestCount: text })}
            placeholder={`${event.minCapacity} - ${event.maxCapacity} guests`}
            keyboardType="numeric"
          />
        </View>

        {/* Venue */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            📍 Venue / Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.inputField}
            value={formData.venue}
            onChangeText={(text) => setFormData({ ...formData, venue: text })}
            placeholder="Enter venue or city"
          />
        </View>

        {/* Budget Range */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>💰 Budget Range (Optional)</Text>
          <View style={styles.budgetRow}>
            <TextInput
              style={[styles.inputField, styles.budgetInput]}
              value={formData.budgetMin}
              onChangeText={(text) => setFormData({ ...formData, budgetMin: text })}
              placeholder="Min budget"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.inputField, styles.budgetInput]}
              value={formData.budgetMax}
              onChangeText={(text) => setFormData({ ...formData, budgetMax: text })}
              placeholder="Max budget"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Special Requests */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>💬 Special Requests (Optional)</Text>
          <TextInput
            style={[styles.inputField, styles.textArea]}
            value={formData.specialRequests}
            onChangeText={(text) => setFormData({ ...formData, specialRequests: text })}
            placeholder="Any special requirements or preferences..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Booking Request</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Our team will review your request and contact you within 24 hours
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  backArrow: {
    fontSize: 20,
    color: '#0f172a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  eventCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventInfoItem: {
    flex: 1,
  },
  eventInfoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  eventInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default BookEventScreen;
