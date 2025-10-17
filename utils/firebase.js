// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {  GoogleAuthProvider, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore  } from "firebase/firestore";

// Prefer Expo extra (EAS env), then @env, then safe fallbacks
let FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID;
try {
  const Constants = require('expo-constants').default;
  const extra = Constants?.expoConfig?.extra || Constants?.manifest2?.extra || {};
  FIREBASE_API_KEY = extra.FIREBASE_API_KEY;
  FIREBASE_AUTH_DOMAIN = extra.FIREBASE_AUTH_DOMAIN;
  FIREBASE_PROJECT_ID = extra.FIREBASE_PROJECT_ID;
  FIREBASE_STORAGE_BUCKET = extra.FIREBASE_STORAGE_BUCKET;
  FIREBASE_MESSAGING_SENDER_ID = extra.FIREBASE_MESSAGING_SENDER_ID;
  FIREBASE_APP_ID = extra.FIREBASE_APP_ID;
  FIREBASE_MEASUREMENT_ID = extra.FIREBASE_MEASUREMENT_ID;
} catch (_) {}

// Do not attempt to import from @env; rely solely on expo constants or fallback 
// ignore in git push


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