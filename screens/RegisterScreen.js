import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, BackHandler, Dimensions } from "react-native";
import { auth } from "../utils/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { validateEmail, validatePassword } from '../utils/validation';
import LoadingButton from "../components/Loaders/LoadingButton";
import { useAuthFeedback } from "../context/AuthFeedbackContext";
import { getErrorMessage, getErrorTitle } from "../utils/errorHandler";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const { showAuthFeedback } = useAuthFeedback();

  // Responsive helpers
  const { width } = Dimensions.get('window');
  const guidelineBaseWidth = 390; // iPhone 12 baseline
  const scaleSize = (size) => Math.round((width / guidelineBaseWidth) * size);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Typography and spacing
  const TITLE_FONT = clamp(scaleSize(32), 24, 32);
  const SUBTITLE_FONT = clamp(scaleSize(17), 14, 17);
  const INPUT_FONT = clamp(scaleSize(17), 14, 17);
  const LABEL_FONT = clamp(scaleSize(17), 14, 17);
  const LABEL_ACTIVE_FONT = clamp(scaleSize(13), 12, 13);
  const PASSWORD_HINT_FONT = clamp(scaleSize(13), 12, 13);
  const CONTAINER_PADDING_H = clamp(24, 16, 24);
  const CONTAINER_PADDING_TOP = clamp(24, 16, 32);
  
  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);
  const isFormValid = isEmailValid && isPasswordValid;

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Entry");
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const handleRegister = async () => {
    if (!email || !password) {
      const errorTitle = getErrorTitle('auth');
      const errorMessage = "Please fill all fields.";
      showAuthFeedback(errorTitle, errorMessage);
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCred.user);
      navigation.navigate("EmailVerification");
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
      <View style={[styles.container, { paddingHorizontal: CONTAINER_PADDING_H, paddingTop: CONTAINER_PADDING_TOP }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={[styles.title, { fontSize: TITLE_FONT }]}>Sign up</Text>
        <Text allowFontScaling={false} style={[styles.subtitle, { fontSize: SUBTITLE_FONT }]}>Add your email and password.</Text>
        {/* Email Input with Floating Label */}
        <View style={styles.inputGroup}>
          <View style={styles.floatingLabelContainer}>
            <Text
              style={[
                styles.floatingLabel,
                { fontSize: LABEL_FONT },
                (emailFocused || email) && [styles.floatingLabelActive, { fontSize: LABEL_ACTIVE_FONT }]
              ]}
            >
              Your email
            </Text>
            <TextInput
              ref={emailInputRef}
              style={[
                styles.input,
                { fontSize: INPUT_FONT },
                emailFocused ? { borderColor: '#007AFF' } : { borderColor: '#aaa' }
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              accessibilityLabel="Email"
              returnKeyType="next"
              placeholder={!emailFocused && !email ? 'Your email' : ''}
              onSubmitEditing={() => passwordInputRef.current && passwordInputRef.current.focus()}
            />
          </View>
        </View>
        {/* Password Input with Floating Label */}
        <View style={styles.inputGroup}>
          <View style={styles.floatingLabelContainer}>
            <Text
              style={[
                styles.floatingLabel,
                { fontSize: LABEL_FONT },
                (passwordFocused || password) && [styles.floatingLabelActive, { fontSize: LABEL_ACTIVE_FONT }]
              ]}
            >
              Your password
            </Text>
            <TextInput
              ref={passwordInputRef}
              style={[
                styles.input,
                { fontSize: INPUT_FONT },
                passwordFocused ? { borderColor: '#007AFF' } : { borderColor: '#aaa' }
              ]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              accessibilityLabel="Password"
              returnKeyType="done"
              placeholder={!passwordFocused && !password ? 'Your password' : ''}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Ionicons name="eye" size={24} color="black" /> 
                           : <Ionicons name="eye-off" size={24} color="black" />}
            </TouchableOpacity>
          </View>
        </View>
        <Text allowFontScaling={false} style={[styles.passwordHint, { fontSize: PASSWORD_HINT_FONT }]}>
           Your password must be at least 8 characters long. Avoid the common pattrens.
        </Text>
          <LoadingButton
            style={[
              styles.signupBtn,
              !isFormValid && { opacity: 0.5, backgroundColor: '#77afeaff' },
            ]}
            onPress={handleRegister}
            disabled={!isFormValid}
            isLoading={loading}
            title="Sign up"
            accessibilityLabel="Sign up"
          />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f8fa" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24, marginTop: 40 },
  backBtn: { marginBottom: 10, marginLeft: -8 },
  backArrow: { fontSize: 28, color: "#222" },
  title: { fontSize: 32, fontWeight: "bold", color: "#222", marginBottom: 6 },
  subtitle: { fontSize: 17, color: "#222", marginBottom: 24 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 15, color: "#0007AFF0", marginBottom: 4, marginLeft: 6 },
  input: {
    height: 54,
    borderColor: "#007AFF",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    backgroundColor: "#f6f8fa",
    color: "#222",
  },
  passwordInput: { borderColor: "#ddd", marginBottom: 0 },
  eyeBtn: {
    position: "absolute",
    right: 16,
    top: 14,
    padding: 4,
  },
  signupBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    marginTop: 24,
  },
  signupText: { color: "#fff", fontSize: 18, fontWeight: "600" },
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
  passwordHint: {
    fontSize: 13,
    color: "#555",
    marginBottom: 0,

  },
});