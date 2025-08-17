import React, { useState, useRef, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../utils/firebase";
import { updateProfile } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from '../context/AuthContext';
import LoadingButton from "../components/Loaders/LoadingButton";
import { useAuthFeedback } from "../context/AuthFeedbackContext";

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const { uploadImageToCloudinary, completeProfile } = useContext(AuthContext);
  const { showAuthFeedback } = useAuthFeedback();
  const [name, setName] = useState(auth.currentUser?.displayName || "");
  const [photo, setPhoto] = useState(auth.currentUser?.photoURL || null);
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const nameInputRef = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPhoto(uri);
      }
    } catch (error) {
      showAuthFeedback("Error", "Failed to select image: " + error.message);
    }
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      showAuthFeedback("Error", "Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      let finalPhotoURL = photo;

      // Upload new image only if it's a local URI
      if (photo && !photo.startsWith("https://")) {
        try {
          finalPhotoURL = await uploadImageToCloudinary(photo);
          if (!finalPhotoURL) {
            throw new Error("Failed to upload image to Cloudinary");
          }
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          showAuthFeedback(
            "Upload Failed", 
            "Could not upload your profile picture. Please try again."
          );
          return;
        }
      }

      // Update Firebase auth profile
      await updateProfile(auth.currentUser, {
        displayName: name.trim(),
        photoURL: finalPhotoURL,
      });

      // Mark profile as complete in Firestore
      await completeProfile({
        displayName: name.trim(),
        photoURL: finalPhotoURL,
        createdAt: new Date().toISOString()
      });

      showAuthFeedback("Success", "Profile updated!", "success");
      
      // Only navigate if component is still mounted and navigator is ready
      if (mounted.current && navigation.isReady()) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }

    } catch (error) {
      console.error("Profile update error:", error);
      showAuthFeedback("Error", error.message || "Failed to complete profile setup");
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Meet your FlowDo self</Text>
          <Text style={styles.subtitle}>Your productivity journey starts here</Text>

          <View style={styles.profileCard}>
            <Text style={styles.cardTitle}>Complete your profile</Text>

            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatar} />
                ) : (
                  <Image
                    source={require("../assets/default-avatar.png")}
                    style={styles.avatar}
                  />
                )}
              </View>
              <TouchableOpacity onPress={pickImage} style={styles.editIconContainer}>
                <Ionicons name="camera" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.floatingLabelContainer}>
                <Text
                  style={[
                    styles.floatingLabel,
                    (nameFocused || name) && styles.floatingLabelActive,
                  ]}
                >
                  Your name
                </Text>
                <TextInput
                  ref={nameInputRef}
                  style={[
                    styles.input,
                    { borderColor: nameFocused ? "#007AFF" : "#aaa" },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder={!name && !nameFocused ? "Your Name" : ""}
                  autoCapitalize="none"
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  accessibilityLabel="Username"
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          <LoadingButton
            style={styles.continueBtn}
            isLoading={loading}
            onPress={handleContinue}
            title="Start My Journey"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f8fa" },
  container: { flex: 1, paddingHorizontal: 17, paddingTop: 24 },
  title: { fontSize: 26, fontWeight: "bold", color: "#222", marginBottom: 6 },
  subtitle: { fontSize: 17, color: "#888", marginBottom: 25 },
  profileCard: {
    backgroundColor: "#e3edf7ff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 18,
    marginBottom: 32,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#222", marginBottom: 12 },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  avatarCircle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    resizeMode: "cover",
  },
  editIconContainer: {
    position: "absolute",
    bottom: -2,
    right: -width * 0.04,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingLabelContainer: {
    position: "relative",
    justifyContent: "center",
  },
  floatingLabel: {
    position: "absolute",
    left: 18,
    top: 18,
    fontSize: 17,
    color: "#aaa",
    zIndex: 2,
    backgroundColor: "#f6f8fa",
    paddingHorizontal: 2,
  },
  floatingLabelActive: {
    top: -10,
    left: 12,
    fontSize: 13,
    color: "#007AFF",
    backgroundColor: "#e3edf7ff",
    paddingHorizontal: 2,
  },
  inputGroup: { marginTop: 20, marginBottom: 18 },
  input: {
    height: 54,
    width: width * 0.7,
    borderColor: "#007AFF",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    backgroundColor: "#f6f8fa",
    color: "#222",
  },
  continueBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    marginTop: 18,
    width: "100%",
  },
  continueText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});