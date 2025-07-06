import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { TaskProvider } from './context/TaskContext';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './screens/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;

const user = { 
        email: "testuser@example.com",
         password: "yourpassword" 
        }

const HARDCODED_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTIwNzU3NzEsInVzZXJJZCI6IjY4NjZiYzZkZmViN2JiNWM4MmQxM2NkMSJ9.Bye2fwPdcqLWXC4bgs4ZsDa3YdBEIaQMQD1o9BG2Nro"; 

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Store the hardcoded token in AsyncStorage on app start (simulating login: only for testing purposes)
    AsyncStorage.setItem('token', HARDCODED_TOKEN);

    const timer = setTimeout(() => setShowSplash(false), 2000);
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
      .then(res => {
       console.log("Request Sent!");
       return res.json();
     })
     .then(data => console.log(data))
     .catch(err => console.error(err));
  
       return () => clearTimeout(timer);
        }, []);

     if (showSplash) {
       return <SplashScreen />;
     }
     return (
    <TaskProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#f6f8fa" translucent />
        <AppNavigator />
      </NavigationContainer>
    </TaskProvider>
  );
}
