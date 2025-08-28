// context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

// Import Firebase with error handling
let auth, db;
try {
  const firebase = require("../utils/firebase");
  auth = firebase.auth;
  db = firebase.db;
} catch (error) {
  console.error("❌ Failed to import Firebase:", error);
  // Create mock objects to prevent crashes
  auth = { currentUser: null };
  db = null;
}

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [firebaseToken, setFirebaseToken] = useState(null);
  const [firebaseError, setFirebaseError] = useState(null);

  // Loader + internet state
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Monitor internet connection
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribeNetInfo();
  }, []);

  // Debug logs
  useEffect(() => {
    if (__DEV__) {
      console.log("🔐 AuthContext State Debug:", { user, profile, initializing, firebaseTokenExists: !!firebaseToken, loading, isConnected, firebaseError });
    }
  }, [user, profile, initializing, firebaseToken, loading, isConnected, firebaseError]);

  // Check if Firebase is properly initialized
  useEffect(() => {
    if (!auth || !db) {
      setFirebaseError("Firebase not properly initialized");
      setInitializing(false);
      return;
    }
  }, []);

  // Fetch Firebase token
  const getFirebaseToken = async (u) => {
    try {
      if (!auth || !u) return null;
      
      const token = await u.getIdToken(true);
      await AsyncStorage.setItem("firebaseToken", token);
      setFirebaseToken(token);
      return token;
    } catch (error) {
      console.error("❌ Error getting Firebase token:", error);
      // Don't crash the app, just return null
      return null;
    }
  };

  // Get current Firebase token (restored function)
  const getCurrentToken = async () => {
    try {
      if (firebaseToken) return firebaseToken;

      const token = await AsyncStorage.getItem("firebaseToken");
      if (token) {
        setFirebaseToken(token);
        return token;
      }

      if (auth && auth.currentUser) {
        const newToken = await auth.currentUser.getIdToken(true);
        await AsyncStorage.setItem("firebaseToken", newToken);
        setFirebaseToken(newToken);
        return newToken;
      }

      return null;
    } catch (error) {
      console.error("❌ Error getting current token:", error);
      return null;
    }
  };

  // Fetch Firestore profile
  const fetchProfile = async (uid) => {
    try {
      if (!db || !uid) return null;
      
      const { doc, getDoc } = require("firebase/firestore");
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      console.error("❌ Error fetching profile from Firestore:", error);
      // Don't crash the app, return null and continue
      return null;
    }
  };

  // Reload user (restored function)
  const reloadUser = async () => {
    try {
      if (!auth || !auth.currentUser) return null;
      
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser); 
      return updatedUser;
    } catch (error) {
      console.error("❌ Error reloading user:", error);
      return null;
    }
  };

  // Auth listener
  useEffect(() => {
    if (!auth) {
      setInitializing(false);
      return;
    }

    let isMounted = true;
    
    try {
      const { onAuthStateChanged } = require("firebase/auth");
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;
        
        setLoading(true);
        try {
          if (firebaseUser) {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Auth timeout')), 10000)
            );
            
            const reloadPromise = firebaseUser.reload();
            
            await Promise.race([reloadPromise, timeoutPromise]);
            
            if (!isMounted) return;
            
            setUser(firebaseUser);
            await getFirebaseToken(firebaseUser);
            const userProfile = await fetchProfile(firebaseUser.uid);
            
            if (isMounted) {
              setProfile(userProfile);
            }
          } else {
            if (isMounted) {
              setUser(null);
              setProfile(null);
              await AsyncStorage.removeItem("firebaseToken");
              setFirebaseToken(null);
            }
          }
        } catch (err) {
          console.error("❌ Error in auth state handler:", err);
          // Don't crash the app, set user to null and continue
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        } finally {
          if (isMounted) {
            setInitializing(false);
            setLoading(false);
          }
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (error) {
      console.error("❌ Failed to set up auth listener:", error);
      setFirebaseError(error.message);
      setInitializing(false);
    }
  }, []);

  // Mark profile complete
  const completeProfile = async (profileFields = {}) => {
    if (!isConnected) throw new Error("No internet connection");
    if (!user?.uid) throw new Error("No authenticated user");
    if (!db) throw new Error("Database not available");
    
    try {
      const { doc, setDoc } = require("firebase/firestore");
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, profileFields, { merge: true });
      
      // Update local state
      setProfile(prev => ({ ...prev, ...profileFields }));
      
      return true;
    } catch (error) {
      console.error("❌ Error completing profile:", error);
      throw error;
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    if (!isConnected) throw new Error("No internet connection");
    
    // Try to get Cloudinary config from environment
    let CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET;
    try {
      const Constants = require('expo-constants').default;
      const extra = Constants?.expoConfig?.extra || Constants?.manifest2?.extra || {};
      CLOUDINARY_CLOUD_NAME = extra.CLOUDINARY_CLOUD_NAME;
      CLOUDINARY_UPLOAD_PRESET = extra.CLOUDINARY_UPLOAD_PRESET;
    } catch (_) {}
    // Fallback values
    CLOUDINARY_CLOUD_NAME = CLOUDINARY_CLOUD_NAME || 'dl0fl7kvn';
    CLOUDINARY_UPLOAD_PRESET = CLOUDINARY_UPLOAD_PRESET || 'FlowDo Mobile App';

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary configuration missing");
    }

    try {
      const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("❌ Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      if (auth) {
        const { signOut } = require("firebase/auth");
        await signOut(auth);
      }
      await AsyncStorage.removeItem("firebaseToken");
      setFirebaseToken(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Even if logout fails, clear local state
      setUser(null);
      setProfile(null);
      setFirebaseToken(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser, 
    profile,
    setProfile, 
    initializing,
    loading,
    setLoading, 
    isConnected,
    firebaseToken,
    firebaseError,
    getCurrentToken, 
    reloadUser, 
    completeProfile,
    uploadImageToCloudinary,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
