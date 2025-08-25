// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {  GoogleAuthProvider, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore  } from "firebase/firestore";

// Try to import from @env, with fallbacks for production builds
let FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID;

try {
  const env = require('@env');
  FIREBASE_API_KEY = env.FIREBASE_API_KEY;
  FIREBASE_AUTH_DOMAIN = env.FIREBASE_AUTH_DOMAIN;
  FIREBASE_PROJECT_ID = env.FIREBASE_PROJECT_ID;
  FIREBASE_STORAGE_BUCKET = env.FIREBASE_STORAGE_BUCKET;
  FIREBASE_MESSAGING_SENDER_ID = env.FIREBASE_MESSAGING_SENDER_ID;
  FIREBASE_APP_ID = env.FIREBASE_APP_ID;
  FIREBASE_MEASUREMENT_ID = env.FIREBASE_MEASUREMENT_ID;
} catch (error) {
  console.warn('Failed to load environment variables from @env, using fallbacks');
  // Fallback values for production builds
  FIREBASE_API_KEY = 'AIzaSyDdB8w-Ww8cE7l_7DB5tCGKGcm3WBPScHI';
  FIREBASE_AUTH_DOMAIN = 'flowdo-gtd.firebaseapp.com';
  FIREBASE_PROJECT_ID = 'flowdo-gtd';
  FIREBASE_STORAGE_BUCKET = 'flowdo-gtd.firebasestorage.app';
  FIREBASE_MESSAGING_SENDER_ID = '348188214999';
  FIREBASE_APP_ID = '1:348188214999:web:4f306be9e1d86b2081d292';
  FIREBASE_MEASUREMENT_ID = 'G-2X3TNY0LJ8';
}

// Validate Firebase configuration
if (!FIREBASE_API_KEY || !FIREBASE_AUTH_DOMAIN || !FIREBASE_PROJECT_ID) {
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
let app, auth, googleProvider, db;

try {
  app = initializeApp(firebaseConfig);
  
  //Set up Auth with AsyncStorage for persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export { app, auth, googleProvider, db };