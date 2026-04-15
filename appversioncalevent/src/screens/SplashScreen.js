import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';

export const SplashScreen = ({ navigation }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Prevent back button from closing app on splash screen
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ translateY }], alignItems: 'center' }}>
        <Text style={styles.logo}>CALEVENT</Text>
        <Text style={styles.tagline}>Create Unforgettable Moments</Text>
        <View style={styles.dots}>
          <View style={[styles.dot, { opacity: 0.6 }]} />
          <View style={[styles.dot, { opacity: 0.8 }]} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Login as Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.btnOutline} 
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlineText}>Create Account</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo:          { fontSize: 52, fontWeight: '800', color: '#fff', letterSpacing: -1, marginBottom: 12 },
  tagline:       { fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  dots:          { flexDirection: 'row', gap: 8, marginTop: 48 },
  dot:           { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  btn:           { marginTop: 48, backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24, width: '100%', alignItems: 'center' },
  btnText:       { color: '#7c3aed', fontSize: 16, fontWeight: '700' },
  btnOutline:    { marginTop: 12, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#fff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24, width: '100%', alignItems: 'center' },
  btnOutlineText:{ color: '#fff', fontSize: 16, fontWeight: '700' },
});
