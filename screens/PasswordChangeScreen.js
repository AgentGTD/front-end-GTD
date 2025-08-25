import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { validatePassword } from "../utils/validation";
import LoadingButton from "../components/Loaders/LoadingButton";
import { useAuthFeedback } from "../context/AuthFeedbackContext";
import { getErrorMessage, getErrorTitle } from "../utils/errorHandler";

export default function ChangePasswordScreen() {
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const currentRef = useRef(null);
  const newRef = useRef(null);
  const confirmRef = useRef(null);

  const { showAuthFeedback } = useAuthFeedback();

  const isFormValid =
    currentPassword.trim() &&
    newPassword.trim() &&
    confirmPassword.trim() &&
    validatePassword(newPassword) &&
    validatePassword(confirmPassword) &&
    newPassword === confirmPassword;

  const handleChangePassword = async () => {
    if (!isFormValid) {
      const errorTitle = getErrorTitle('auth');
      const errorMessage = "Please fill all fields correctly.";
      showAuthFeedback(errorTitle, errorMessage);
      return;
    }

    if (newPassword.length < 6) {
      const errorTitle = getErrorTitle('auth');
      const errorMessage = "Password must be at least 6 characters.";
      showAuthFeedback(errorTitle, errorMessage);
      return;
    }

    setLoading(true);
    const user = auth.currentUser;

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      showAuthFeedback("Success", "Your password has been updated.", "success");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      const errorTitle = getErrorTitle('auth');
      const errorMessage = getErrorMessage(error, 'auth');
      showAuthFeedback(errorTitle, errorMessage);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      currentRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    label,
    value,
    setValue,
    show,
    setShow,
    inputRef,
    onSubmitEditing,
    fieldName
  ) => {
    const isActive = focusedField === fieldName || value;
    const isFocused = focusedField === fieldName;

    return (
      <View style={styles.floatingLabelContainer}>
        <Text
          style={[
            styles.floatingLabel,
            isActive && styles.floatingLabelActive,
            isFocused && { color: "#007AFF" },
          ]}
        >
          {label}
        </Text>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            isFocused && { borderColor: "#007AFF" },
          ]}
          value={value}
          onChangeText={setValue}
          secureTextEntry={!show}
          autoCapitalize="none"
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField("")}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="next"
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShow(!show)}
        >
          <Ionicons
            name={show ? "eye-off" : "eye"}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
        <Text style={styles.header}>Change Password</Text>
        </View>
        
        {renderPasswordInput(
          "Current Password",
          currentPassword,
          setCurrentPassword,
          showCurrent,
          setShowCurrent,
          currentRef,
          () => newRef.current?.focus(),
          "current"
        )}
        {renderPasswordInput(
          "New Password",
          newPassword,
          setNewPassword,
          showNew,
          setShowNew,
          newRef,
          () => confirmRef.current?.focus(),
          "new"
        )}
        {renderPasswordInput(
          "Confirm New Password",
          confirmPassword,
          setConfirmPassword,
          showConfirm,
          setShowConfirm,
          confirmRef,
          handleChangePassword,
          "confirm"
        )}

        <Text style={styles.subtitle}>
           Your password must be at least 8 characters long. Avoid the common pattrens.
        </Text>

        <LoadingButton
          style={[!isFormValid && { opacity: 0.6 }]}
          onPress={handleChangePassword}
          disabled={!isFormValid}
          isLoading={loading}
          title="Change Password"
        />

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("ResetPassword")}
        >
          <Text style={styles.backText}>Forgot Password?</Text>
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
    marginBottom: 28,
    gap: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginLeft: 8,
  },
subtitle: { fontSize: 13, marginBottom: 25, color: "#555", textAlign: "center" },
  floatingLabelContainer: {
    position: "relative",
    justifyContent: "center",
    marginBottom: 18,
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
    transition: "all 0.2s",
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
    borderColor: "#aaa",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    backgroundColor: "#f6f8fa",
    color: "#222",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 4,
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
