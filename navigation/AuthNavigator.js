import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import EntryScreen from '../screens/EntryScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import PasswordResetScreen from '../screens/PasswordResetScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
      initialRouteName="Entry"
    >
      <Stack.Screen name="Entry" component={EntryScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="EmailVerify" component={EmailVerificationScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="ResetPassword" component={PasswordResetScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
