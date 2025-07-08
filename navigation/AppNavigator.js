import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import TodayScreen from '../screens/TodayScreen';
import InboxScreen from '../screens/InboxScreen';
import ProjectsStack from './ProjectsStack';
import NextActionsScreen from '../screens/NextActionsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FBFAF8',
          height: 125,
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
          paddingBottom: 8,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          if (route.name === 'Today') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Inbox') iconName = focused ? 'mail' : 'mail-outline';
          else if (route.name === 'Projects') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Next Actions') iconName = focused ? 'flash' : 'flash-outline';

          return (
            <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Projects" component={ProjectsStack} />
      <Tab.Screen name="Next Actions" component={NextActionsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeTabIconContainer: {
    backgroundColor: '#e0f7fa',
    borderRadius: 20,
  },
});