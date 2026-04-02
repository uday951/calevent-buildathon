import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const variantStyles = {
  default:  { bg: 'rgba(124,58,237,0.9)', text: '#fff' },
  success:  { bg: '#dcfce7', text: '#16a34a' },
  warning:  { bg: '#fef9c3', text: '#ca8a04' },
  error:    { bg: '#fee2e2', text: '#dc2626' },
};

export const Badge = ({ children, variant = 'default', style }) => {
  const v = variantStyles[variant] || variantStyles.default;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, alignSelf: 'flex-start' },
  text:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});
