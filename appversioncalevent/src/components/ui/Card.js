import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    // Very soft shadow, typical for Swiggy/Zomato clean styles
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2, // For Android
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9', // Very subtle border instead of heavy shadow
  }
});
