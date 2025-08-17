import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TaskProvider } from './context/TaskContext';
import { ChatBotProvider, useChatBot } from './context/ChatBotContext';
import ChatBotModal from './components/ChatBotModal';
import { SnackbarProvider } from './context/SnackBarContext';
import SplashScreen from './screens/SplashScreen';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { View, Platform, StatusBar as RNStatusBar } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import InternetIndicator from './components/Loaders/InternetIndicator';
import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
//import ProfileSetupScreen from './screens/ProfileSetupScreen';
//import EmailVerificationScreen from './screens/EmailVerificationScreen';
import { LoadingProvider } from './context/LoadingContext';

// Create a root stack navigator
const RootStack = createStackNavigator();

function RootNavigator() {
  const { user, profile, initializing } = useContext(AuthContext);
  const { visible, closeChatBot } = useChatBot();

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        { !user &&  !user?.emailVerified && !profile?.profileComplete? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) :  (
          <RootStack.Screen name="App" component={AppNavigator} />
        )}
      </RootStack.Navigator>
      <InternetIndicator />
      <ChatBotModal visible={visible} onClose={closeChatBot} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TaskProvider>
          <ChatBotProvider>
            <SnackbarProvider>
              <LoadingProvider>
               <NavigationContainer>
                 <View style={{
                   height: Platform.OS === 'android' ? RNStatusBar.currentHeight : Constants.statusBarHeight,
                   backgroundColor: '#f6f8fa',
                 }} />
                 <RNStatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
                 <RootNavigator />
               </NavigationContainer>
              </LoadingProvider>
            </SnackbarProvider>
          </ChatBotProvider>
        </TaskProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}