import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';

import { SplashScreen }        from '../screens/SplashScreen';
import { HomeScreen }          from '../screens/HomeScreen';
import { ExploreScreen }       from '../screens/ExploreScreen';
import { BookingsScreen }      from '../screens/BookingsScreen';
import { ProfileScreen }       from '../screens/ProfileScreen';
import { EventDetailScreen }   from '../screens/EventDetailScreen';
import { LoginScreen }         from '../screens/LoginScreen';
import { RegisterScreen }      from '../screens/RegisterScreen';
import { PlanMyEventScreen }   from '../screens/PlanMyEventScreen';
import { MyRequestsScreen }    from '../screens/MyRequestsScreen';
import { FlashOffersScreen }   from '../screens/FlashOffersScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreenNew';
import { AdminProvidersScreen } from '../screens/AdminProvidersScreen';
import { AdminBookingsScreen } from '../screens/AdminBookingsScreen';
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import { AdminAnalyticsScreen } from '../screens/AdminAnalyticsScreen';
import { AdminEventRequestsScreen } from '../screens/AdminEventRequestsScreen';
import BookEventScreen         from '../screens/BookEventScreen';
import { useAuthStore }        from '../store/useAuthStore';

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
    <Tab.Screen name="Home"       component={HomeScreen}       options={{ tabBarIcon: tabIcon('🏠'), tabBarLabel: 'Home' }} />
    <Tab.Screen name="Explore"    component={ExploreScreen}    options={{ tabBarIcon: tabIcon('🔍'), tabBarLabel: 'Explore' }} />
    <Tab.Screen name="MyRequests" component={MyRequestsScreen} options={{ tabBarIcon: tabIcon('📋'), tabBarLabel: 'Requests' }} />
    <Tab.Screen name="Profile"    component={ProfileScreen}    options={{ tabBarIcon: tabIcon('👤'), tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { isLoading, isAuthenticated, user, initAuth } = useAuthStore();

  useEffect(() => { initAuth(); }, [initAuth]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3e8ff' }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#7c3aed', marginBottom: 16 }}>CALEVENT</Text>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          user?.role === 'admin' ? (
            // Admin Dashboard
            <>
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              <Stack.Screen name="AdminProviders" component={AdminProvidersScreen} />
              <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} />
              <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
              <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
              <Stack.Screen name="AdminEventRequests" component={AdminEventRequestsScreen} />
            </>
          ) : (
            // Customer App
            <>
              <Stack.Screen name="Main"         component={MainTabs} />
              <Stack.Screen name="EventDetail"  component={EventDetailScreen} />
              <Stack.Screen name="BookEvent"    component={BookEventScreen} />
              <Stack.Screen name="PlanMyEvent"  component={PlanMyEventScreen} />
              <Stack.Screen name="FlashOffers"  component={FlashOffersScreen} />
              <Stack.Screen name="Bookings"     component={BookingsScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Splash"       component={SplashScreen} />
            <Stack.Screen name="Login"        component={LoginScreen} />
            <Stack.Screen name="Register"     component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
