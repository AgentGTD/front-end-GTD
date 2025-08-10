import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import ActivityLogScreen from '../screens/ActivityLogScreen';
import AccountScreen from '../screens/AccountScreen';
import PasswordResetScreen from '../screens/PasswordResetScreen';
import ChangePasswordScreen from '../screens/PasswordChangeScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
       <Stack.Screen name="ResetPassword" component={PasswordResetScreen} />
    </Stack.Navigator>
  );
}
