import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigation } from "@react-navigation/native";
import { validateEmail } from '../utils/validation';
import { Ionicons } from "@expo/vector-icons";
import LoadingButton from "../components/Loaders/LoadingButton";
import { useAuthFeedback } from "../context/AuthFeedbackContext";
import { getErrorMessage, getErrorTitle } from "../utils/errorHandler";

export default function PasswordResetScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const emailInputRef = useRef(null);
  const navigation = useNavigation();
  const { showAuthFeedback } = useAuthFeedback();
  const isEmailValid = validateEmail(email);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      const errorTitle = getErrorTitle('auth');
      const errorMessage = "Please enter your email.";
      showAuthFeedback(errorTitle, errorMessage);
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showAuthFeedback(
        "Password Reset Sent",
        "Check your email for the reset link. Follow the instructions to reset your password.",
        "success"
      );
      navigation.navigate("Login");
    } catch (error) {
      const errorTitle = getErrorTitle('auth');
      const errorMessage = getErrorMessage(error, 'auth');
      showAuthFeedback(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
         <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                  </TouchableOpacity>
                <Text style={styles.header}>Reset Password</Text>
                </View>
        <Text style={styles.subtitle}>
          Enter your registered email address and we’ll send you a link to reset your password.
        </Text>
        <View style={styles.inputGroup}>
          <View style={styles.floatingLabelContainer}>
            <Text
              style={[
                styles.floatingLabel,
                (emailFocused || email) && styles.floatingLabelActive
              ]}
            >
              Your email
            </Text>
            <TextInput
              ref={emailInputRef}
              style={[
                styles.input,
                (emailFocused || email)
                  ? { borderColor: '#007AFF' }
                  : { borderColor: '#ddd' }
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              accessibilityLabel="Email"
              returnKeyType="done"
            />
          </View>
        </View>
        <LoadingButton
          style={[!isEmailValid && { backgroundColor: '#77afeaff', opacity: 0.7 }]}
          onPress={handleResetPassword}
          disabled={!isEmailValid}
          isLoading={loading}
          title="Send Reset Link"
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.replace("Login")}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f8fa" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 12,
    gap: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginLeft: 8,
  },
  subtitle: { fontSize: 16, marginBottom: 25, color: "#555", textAlign: "center" },
  inputGroup: { marginBottom: 18 },
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
    backgroundColor: "#f6f8fa",
    paddingHorizontal: 2,
  },
  input: {
    height: 54,
    borderColor: "#ddd",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    backgroundColor: "#f6f8fa",
    color: "#222",
    marginBottom: 0,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  backBtn: { marginTop: 18, alignItems: "center" },
  backText: { color: "#888", fontSize: 15, textDecorationLine: "underline" },
});