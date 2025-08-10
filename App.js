import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TaskProvider } from './context/TaskContext';
import { ChatBotProvider, useChatBot } from './context/ChatBotContext';
import ChatBotModal from './components/ChatBotModal';
import { SnackbarProvider } from './context/SnackBarContext';
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import SplashScreen from './screens/SplashScreen';
import EmailVerifyScreen from './screens/EmailVerificationScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { View, Platform, StatusBar as RNStatusBar } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';



function AppRoot() {
  const { visible, closeChatBot } = useChatBot();
  const { user, profile, initializing } = useContext(AuthContext);


  if (initializing) return <SplashScreen />;
  if (!user) return <AuthNavigator />;
  if (!user.emailVerified) return <EmailVerifyScreen />; 
  if (!profile?.profileComplete) return <ProfileSetupScreen />;
  //const isLoggedIn = user && user.emailVerified;
  
  return (
    <>
      <AppNavigator /> 
    <ChatBotModal  visible={visible} onClose={closeChatBot} /> 
      
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
            <NavigationContainer>
              <View style={{
                height: Platform.OS === 'android' ? RNStatusBar.currentHeight : Constants.statusBarHeight,
                backgroundColor: '#f6f8fa',
              }} />
              <RNStatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
              <AppRoot />
            </NavigationContainer>
          </SnackbarProvider>
        </ChatBotProvider>
      </TaskProvider>
    </AuthProvider>
  </SafeAreaProvider>
    
  );
}