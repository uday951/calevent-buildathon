import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';

export const RegisterScreen = ({ navigation }) => {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const register = useAuthStore(s => s.register);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [navigation]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      Alert.alert('Error', 'Phone number must be 10 digits');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(form.name, form.email, form.phone, form.password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success! 🎉', result.message || 'Account created successfully!');
      // If no token (pending approval), go back to login
      if (!result.token) navigation.navigate('Login');
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  const fields = [
    { key: 'name',    label: 'Full Name',       icon: '👤', placeholder: 'Enter your full name',    keyboard: 'default',       secure: false },
    { key: 'email',   label: 'Email Address',   icon: '✉️', placeholder: 'Enter your email',        keyboard: 'email-address', secure: false },
    { key: 'phone',   label: 'Phone Number',    icon: '📞', placeholder: '10-digit phone number',   keyboard: 'phone-pad',     secure: false },
    { key: 'password',label: 'Password',        icon: '🔒', placeholder: 'Create a password',       keyboard: 'default',       secure: true  },
    { key: 'confirm', label: 'Confirm Password',icon: '🔒', placeholder: 'Confirm your password',   keyboard: 'default',       secure: true  },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.logoWrap}>
            <Text style={styles.logo}>CALEVENT</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Join CALEVENT 🎉</Text>
            <Text style={styles.sub}>Create your customer account</Text>

            {fields.map(f => (
              <View key={f.key} style={styles.fieldWrap}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.inputIcon}>{f.icon}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="#94a3b8"
                    value={form[f.key]}
                    onChangeText={v => set(f.key, v)}
                    keyboardType={f.keyboard}
                    autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'words'}
                    secureTextEntry={f.secure && !showPass}
                  />
                  {f.secure && (
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.registerBtnText}>Create Account →</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#f3e8ff' },
  scroll:        { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  logoWrap:      { alignItems: 'center', marginBottom: 24 },
  logo:          { fontSize: 36, fontWeight: '900', color: '#7c3aed', letterSpacing: -1 },
  tagline:       { fontSize: 14, color: '#64748b', marginTop: 4 },
  card:          { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
  title:         { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  sub:           { fontSize: 14, color: '#64748b', marginBottom: 20 },
  fieldWrap:     { marginBottom: 14 },
  label:         { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  inputIcon:     { fontSize: 16, marginRight: 8 },
  input:         { flex: 1, fontSize: 15, color: '#0f172a' },
  eyeIcon:       { fontSize: 18, paddingLeft: 8 },
  registerBtn:   { backgroundColor: '#7c3aed', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled:   { opacity: 0.6 },
  registerBtnText:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink:     { alignItems: 'center', marginTop: 16 },
  loginLinkText: { fontSize: 14, color: '#64748b' },
  loginLinkBold: { color: '#7c3aed', fontWeight: '700' },
});
