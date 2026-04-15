import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';

export const LoginScreen = ({ navigation }) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const login = useAuthStore(s => s.login);

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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

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

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>CALEVENT</Text>
            <Text style={styles.tagline}>Your Event Planning Partner</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back 👋</Text>
            <Text style={styles.sub}>Sign in to your customer account</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginBtnText}>Sign In →</Text>
              }
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.registerBtnText}>Create New Account</Text>
            </TouchableOpacity>

            <Text style={styles.providerNote}>
              Are you a provider?{' '}
              <Text style={styles.providerLink}>Provider login coming soon</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#f3e8ff' },
  scroll:           { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  logoWrap:         { alignItems: 'center', marginBottom: 28 },
  logo:             { fontSize: 36, fontWeight: '900', color: '#7c3aed', letterSpacing: -1 },
  tagline:          { fontSize: 14, color: '#64748b', marginTop: 4 },
  card:             { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
  title:            { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  sub:              { fontSize: 14, color: '#64748b', marginBottom: 24 },
  fieldWrap:        { marginBottom: 16 },
  label:            { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  inputIcon:        { fontSize: 16, marginRight: 8 },
  input:            { flex: 1, fontSize: 15, color: '#0f172a' },
  eyeIcon:          { fontSize: 18, paddingLeft: 8 },
  loginBtn:         { backgroundColor: '#7c3aed', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider:          { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine:      { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText:      { marginHorizontal: 12, fontSize: 13, color: '#94a3b8' },
  registerBtn:      { borderWidth: 1.5, borderColor: '#7c3aed', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  registerBtnText:  { color: '#7c3aed', fontSize: 16, fontWeight: '700' },
  providerNote:     { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 },
  providerLink:     { color: '#7c3aed' },
});
