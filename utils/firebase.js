// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {  GoogleAuthProvider, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCievzk6UZrLzJJfgt1fAmC_cHpy2bSGVY",
  authDomain: "flowdo-aa2dc.firebaseapp.com",
  projectId: "flowdo-aa2dc",
  storageBucket: "flowdo-aa2dc.firebasestorage.app",
  messagingSenderId: "113536372032",
  appId: "1:113536372032:web:0cab2dbb90b4af7fbffea5",
  measurementId: "G-C6CQ2C965J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Set up Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);
const db = getFirestore(app);

export { app, auth, googleProvider, storage, db };