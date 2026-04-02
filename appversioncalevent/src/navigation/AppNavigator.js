import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { SplashScreen }      from '../screens/SplashScreen';
import { HomeScreen }        from '../screens/HomeScreen';
import { ExploreScreen }     from '../screens/ExploreScreen';
import { BookingsScreen }    from '../screens/BookingsScreen';
import { ProfileScreen }     from '../screens/ProfileScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const tabIcon = (emoji) => ({ focused }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#7c3aed',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f1f5f9', height: 62, paddingBottom: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}
  >
    <Tab.Screen name="Home"     component={HomeScreen}     options={{ tabBarIcon: tabIcon('🏠') }} />
    <Tab.Screen name="Explore"  component={ExploreScreen}  options={{ tabBarIcon: tabIcon('🔍') }} />
    <Tab.Screen name="Bookings" component={BookingsScreen} options={{ tabBarIcon: tabIcon('📋') }} />
    <Tab.Screen name="Profile"  component={ProfileScreen}  options={{ tabBarIcon: tabIcon('👤') }} />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"       component={SplashScreen} />
      <Stack.Screen name="Main"         component={MainTabs} />
      <Stack.Screen name="EventDetail"  component={EventDetailScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
