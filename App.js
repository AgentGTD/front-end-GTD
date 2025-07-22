import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { TaskProvider } from './context/TaskContext';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './screens/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';
import { ChatBotProvider, useChatBot } from './context/ChatBotContext';
import ChatBotModal from './components/ChatBotModal';

const Testuser = { 
        email: "testuser@example.com",
         password: "yourpassword" 
        }


function AppRoot() {
  const { visible, closeChatBot } = useChatBot();
  const [token, setToken] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken);
  }, [visible]); // refetch token when modal opens

  return (
    <>
      <AppNavigator />
      <ChatBotModal visible={visible} onClose={closeChatBot} token={token} />
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Testuser),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          AsyncStorage.setItem('token', data.token);
          console.log("Token stored:", data.token);
        } else {
          console.error("Login failed:", data);
        }
        setShowSplash(false);
      })
      .catch(err => {
        console.error(err);
        setShowSplash(false);
      });

    
     return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }
  return (
   <TaskProvider>
    <ChatBotProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#f6f8fa" translucent />
        <AppRoot />
      </NavigationContainer>
    </ChatBotProvider>
   </TaskProvider>
  );
}
