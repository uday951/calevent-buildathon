import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'default',
  disabled = false, 
  loading = false,
  style 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button, 
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#7c3aed' : '#ffffff'} />
      ) : (
        <Text style={[
          styles.text, 
          styles[`text_${variant}`],
          styles[`textSize_${size}`]
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#7c3aed', // Matches web primary
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_default: {
    height: 48,
    paddingHorizontal: 20,
  },
  size_sm: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textSize_default: {
    fontSize: 16,
  },
  textSize_sm: {
    fontSize: 14,
  },
  text_primary: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#334155',
  },
  text_ghost: {
    color: '#7c3aed',
  }
});
