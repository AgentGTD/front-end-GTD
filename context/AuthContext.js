// context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import NetInfo from "@react-native-community/netinfo";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";

// Cloudinary URL
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [firebaseToken, setFirebaseToken] = useState(null);

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
    console.log("🔐 AuthContext State Debug:", { user, profile, initializing, firebaseTokenExists: !!firebaseToken, loading, isConnected });
  }, [user, profile, initializing, firebaseToken, loading, isConnected]);

  // Fetch Firebase token
  const getFirebaseToken = async (u) => {
    try {
      if (u) {
        const token = await u.getIdToken(true);
        await AsyncStorage.setItem("firebaseToken", token);
        setFirebaseToken(token);
        return token;
      } else {
        await AsyncStorage.removeItem("firebaseToken");
        setFirebaseToken(null);
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting Firebase token:", error);
      return null;
    }
  };

  // Fetch Firestore profile
  const fetchProfile = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      console.error("❌ Error fetching profile from Firestore:", error);
      return null;
    }
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          await firebaseUser.reload();
          setUser(firebaseUser);
          await getFirebaseToken(firebaseUser);
          const userProfile = await fetchProfile(firebaseUser.uid);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
          await AsyncStorage.removeItem("firebaseToken");
          setFirebaseToken(null);
        }
      } catch (err) {
        console.error("❌ Error in auth state handler:", err);
      } finally {
        setInitializing(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Mark profile complete
  const completeProfile = async (profileFields = {}) => {
    if (!isConnected) throw new Error("No internet connection");
    if (!user?.uid) throw new Error("No authenticated user");

    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const payload = {
        ...profileFields,
        profileComplete: true,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload, { merge: true });
      setProfile((prev) => ({ ...(prev || {}), ...payload }));
    } finally {
      setLoading(false);
    }
  };

  // Cloudinary upload
  const uploadImageToCloudinary = async (imageUri) => {
    if (!isConnected) throw new Error("No internet connection");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", { uri: imageUri, type: "image/jpeg", name: "upload.jpg" });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_API_URL, { method: "POST", body: formData });
      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error("Cloudinary upload failed");
      }
    } catch (error) {
      console.error("❌ Error uploading to Cloudinary:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (!isConnected) throw new Error("No internet connection");

    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setFirebaseToken(null);
      await AsyncStorage.removeItem("firebaseToken");
    } finally {
      setLoading(false);
    }
  };

  // Get current Firebase token
  const getCurrentToken = async () => {
    if (firebaseToken) return firebaseToken;

    const token = await AsyncStorage.getItem("firebaseToken");
    if (token) {
      setFirebaseToken(token);
      return token;
    }

    if (auth.currentUser) {
      const newToken = await auth.currentUser.getIdToken(true);
      await AsyncStorage.setItem("firebaseToken", newToken);
      setFirebaseToken(newToken);
      return newToken;
    }

    return null;
  };

const reloadUser = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser); 
      return updatedUser;
    }
    return null;
  } catch (error) {
    console.error("Error reloading user:", error);
    return null;
  }

  
};
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        initializing,
        logout,
        firebaseToken,
        getCurrentToken,
        completeProfile,
        uploadImageToCloudinary,
        loading,
        setLoading,
        isConnected,
        reloadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
