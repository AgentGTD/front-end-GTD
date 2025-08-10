// context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";

const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase Auth user object
  const [profile, setProfile] = useState(null); // Firestore user profile doc (if any)
  const [initializing, setInitializing] = useState(true);
  const [firebaseToken, setFirebaseToken] = useState(null);

  // Debug logging for state changes
  useEffect(() => {
    console.log("🔐 AuthContext State Debug:");
    console.log(
      "  - user:",
      user
        ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
          }
        : "null"
    );
    console.log("  - profile:", profile);
    console.log("  - initializing:", initializing);
    console.log("  - firebaseToken exists:", !!firebaseToken);
  }, [user, profile, initializing, firebaseToken]);

  // Get fresh Firebase ID token and persist it locally
  const getFirebaseToken = async (u) => {
    console.log("🔑 getFirebaseToken called with user:", u ? u.email : "null");
    try {
      if (u) {
        console.log("🔄 Getting fresh Firebase token...");
        const token = await u.getIdToken(true); // force refresh
        console.log("✅ Firebase token obtained, length:", token ? token.length : 0);

        await AsyncStorage.setItem("firebaseToken", token);
        setFirebaseToken(token);
        console.log("💾 Token saved to AsyncStorage");
        return token;
      } else {
        console.log("🧹 Clearing Firebase token (no user)");
        await AsyncStorage.removeItem("firebaseToken");
        setFirebaseToken(null);
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting Firebase token:", error);
      return null;
    }
  };

  // Helper: fetch Firestore profile for a uid
  const fetchProfile = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching profile from Firestore:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log("🚀 AuthContext useEffect - setting up auth state listener");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log("🔄 Auth state changed:");
        console.log(
          "  - New user:",
          firebaseUser
            ? {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
              }
            : "null"
        );

        if (firebaseUser) {
          // Refresh user to get latest emailVerified status
          try {
            await firebaseUser.reload();
            console.log("🔁 user.reload() called to refresh emailVerified");
          } catch (reloadErr) {
            console.warn("⚠️ user.reload() failed:", reloadErr.message || reloadErr);
          }

          setUser(firebaseUser);

          // Get fresh token
          await getFirebaseToken(firebaseUser);

          // Fetch user profile from Firestore (if exists)
          const userProfile = await fetchProfile(firebaseUser.uid);
          setProfile(userProfile);
          console.log("✅ Profile loaded:", userProfile);
        } else {
          // signed out
          setUser(null);
          setProfile(null);
          await AsyncStorage.removeItem("firebaseToken");
          setFirebaseToken(null);
        }
      } catch (err) {
        console.error("❌ Error in auth state handler:", err);
      } finally {
        console.log("✅ Setting initializing to false");
        setInitializing(false);
      }
    });

    return () => {
      console.log("🧹 Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Mark profile complete (and optionally save fields). merges fields
  const completeProfile = async (profileFields = {}) => {
    if (!user?.uid) {
      throw new Error("No authenticated user to complete profile for");
    }
    try {
      const docRef = doc(db, "users", user.uid);
      const payload = {
        ...profileFields,
        profileComplete: true,
        updatedAt: new Date().toISOString(),
      };
      // merge: if you want to merge rather than overwrite, use setDoc with merge option
      await setDoc(docRef, payload, { merge: true });
      setProfile((prev) => ({ ...(prev || {}), ...payload }));
      console.log("✅ Profile marked complete in Firestore for uid:", user.uid);
    } catch (error) {
      console.error("❌ Error completing profile:", error);
      throw error;
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "upload.jpg"
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_API_URL, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.secure_url) {
        console.log("✅ Image uploaded to Cloudinary:", data.secure_url);
        return data.secure_url;
      } else {
        console.error("❌ Cloudinary upload failed:", data);
        return null;
      }
    } catch (error) {
      console.error("❌ Error uploading to Cloudinary:", error);
      return null;
    }
  };

  const logout = async () => {
    console.log("🚪 Logout initiated");
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setFirebaseToken(null);
      await AsyncStorage.removeItem("firebaseToken");
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Error signing out:", error);
    }
  };

  // Function to get current Firebase token (for API calls)
  const getCurrentToken = async () => {
  try {
    // Return token directly if we already have it
    if (firebaseToken) return firebaseToken;
    
    const token = await AsyncStorage.getItem("firebaseToken");
    if (token) {
      setFirebaseToken(token);
      return token;
    }
    
    // Fetch new token if needed
    const currentUser = auth.currentUser;
    if (currentUser) {
      const newToken = await currentUser.getIdToken(true);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
