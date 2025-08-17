import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from "react-native";
import { auth } from "../utils/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { validateEmail, validatePassword } from '../utils/validation';

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
  
  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);
  const isFormValid = isEmailValid && isPasswordValid;

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCred.user);
      navigation.navigate("EmailVerification");
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Sign up</Text>
        <Text style={styles.subtitle}>Add your email and password.</Text>
        {/* Email Input with Floating Label */}
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
                (passwordFocused || password) && styles.floatingLabelActive
              ]}
            >
              Your password
            </Text>
            <TextInput
              ref={passwordInputRef}
              style={[
                styles.input,
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
          <TouchableOpacity
            style={[
              styles.signupBtn,
              (loading || !isFormValid) && { opacity: 0.7, backgroundColor: '#77afeaff' },
              isFormValid && !loading && { backgroundColor: '#007AFF' }
            ]}
            onPress={handleRegister}
            disabled={loading || !isFormValid}
            accessibilityLabel="Log in"
          >
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
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
    backgroundColor: "#77afeaff",
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
});