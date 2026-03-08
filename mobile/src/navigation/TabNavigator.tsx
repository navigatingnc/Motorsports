import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';
import { TabParamList, AppStackParamList } from './types';

// Screens
import VehiclesScreen from '../screens/VehiclesScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import RecordLapTimeScreen from '../screens/RecordLapTimeScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// --- Vehicles Stack ---
const VehiclesStack = createNativeStackNavigator<Pick<AppStackParamList, 'Vehicles' | 'VehicleDetail'>>();
const VehiclesStackNavigator: React.FC = () => (
  <VehiclesStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0F172A' },
      headerTintColor: '#F8FAFC',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <VehiclesStack.Screen
      name="Vehicles"
      component={VehiclesScreen}
      options={{ headerShown: false }}
    />
    <VehiclesStack.Screen
      name="VehicleDetail"
      component={VehicleDetailScreen}
      options={{ title: 'Vehicle Details', headerShown: false }}
    />
  </VehiclesStack.Navigator>
);

// --- Events Stack ---
const EventsStack = createNativeStackNavigator<Pick<AppStackParamList, 'Events' | 'EventDetail'>>();
const EventsStackNavigator: React.FC = () => (
  <EventsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0F172A' },
      headerTintColor: '#F8FAFC',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <EventsStack.Screen
      name="Events"
      component={EventsScreen}
      options={{ headerShown: false }}
    />
    <EventsStack.Screen
      name="EventDetail"
      component={EventDetailScreen}
      options={{ title: 'Event Details', headerShown: false }}
    />
  </EventsStack.Navigator>
);

// --- Lap Timer Stack ---
const LapTimerStack = createNativeStackNavigator<Pick<AppStackParamList, 'RecordLapTime'>>();
const LapTimerStackNavigator: React.FC = () => (
  <LapTimerStack.Navigator>
    <LapTimerStack.Screen
      name="RecordLapTime"
      component={RecordLapTimeScreen}
      options={{ headerShown: false }}
    />
  </LapTimerStack.Navigator>
);

// --- Tab Icon Helper ---
const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{emoji}</Text>
);

/**
 * Bottom tab navigator that wires together the three core feature areas:
 * Vehicles, Events, and the Lap Timer. Each tab owns its own stack navigator
 * so that detail screens maintain proper back-navigation within each tab.
 */
const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#E11D48',
      tabBarInactiveTintColor: '#475569',
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="VehiclesTab"
      component={VehiclesStackNavigator}
      options={{
        tabBarLabel: 'Vehicles',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🚗" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="EventsTab"
      component={EventsStackNavigator}
      options={{
        tabBarLabel: 'Events',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏁" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="LapTimerTab"
      component={LapTimerStackNavigator}
      options={{
        tabBarLabel: 'Lap Timer',
        tabBarIcon: ({ focused }) => <TabIcon emoji="⏱" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
    borderTopWidth: 1,
    paddingTop: 4,
    height: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

export default TabNavigator;
