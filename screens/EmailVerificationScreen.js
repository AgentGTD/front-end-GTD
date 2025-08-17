import React, { useEffect, useState, useRef, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking, Alert,
 SafeAreaView, Dimensions } from "react-native";
import { auth } from "../utils/firebase";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import {  sendEmailVerification } from "firebase/auth";
import LoadingButton from "../components/Loaders/LoadingButton";
import { useAuthFeedback } from "../context/AuthFeedbackContext";

const { width, height } = Dimensions.get("window");

export default function EmailVerificationScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [checking, setChecking] = useState(false);
  const mounted = useRef(true);
  const { reloadUser } = useContext(AuthContext);
  const { showAuthFeedback } = useAuthFeedback();

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isFocused) return;

    const checkVerification = async () => {
      if (!mounted.current) return;
      try {
        setChecking(true);
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            if (mounted.current) {
              navigation.navigate("ProfileSetup");
            }
          }
        }
      } catch (error) {
        console.error("Verification check error:", error);
      } finally {
        if (mounted.current) {
          setChecking(false);
        }
      }
    };

    checkVerification();
    const interval = setInterval(checkVerification, 3000);

    return () => clearInterval(interval);
  }, [isFocused, reloadUser]);

  const openEmailApp = () => {
    Linking.openURL("mailto:");
  };

  const resendVerificationEmail = async () => {
    if (!mounted.current) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
       await sendEmailVerification(user);
        showAuthFeedback("Verification email sent", "Check your inbox.", "success");
      } else {
        showAuthFeedback("Error", "User not found or cannot send verification email.");
      }
    } catch (error) {
      showAuthFeedback("Error", error.message);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const refreshVerification = async () => {
    if (!mounted.current) return;
    setChecking(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        if (mounted.current) {
          navigation.navigate("ProfileSetup");
        }
      }
      if (!auth.currentUser.emailVerified) {
        showAuthFeedback("Not verified", "Your email is still not verified.");
      }
    } catch (error) {
      showAuthFeedback("Error", error.message);
    }
    finally {
      if (mounted.current) {
        setChecking(false);
      }
    }
  };

  const changeAccount = async () => {
    await auth.signOut();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.info}>
          Click the link we sent to your email
          {"\n"}
          <Text style={styles.email}>{email}</Text>
          {"\n"}to activate your account and start organizing with FlowDo.
        </Text>
        <Text style={styles.info2}>
          Didn’t get it? Check your spam folder or tap below to resend.
        </Text>
        <Image
          source={require("../assets/email-verify.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.primaryBtn]}
            onPress={openEmailApp}
            accessibilityLabel="Open email app"
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Open email</Text>
          </TouchableOpacity>
          <LoadingButton
            style={[styles.button, styles.outlineBtn]}
            textStyle={styles.outlineBtnText}
            isLoading={loading}
            onPress={resendVerificationEmail}
            title="Resend email"
            accessibilityLabel="Resend verification email"
          />
          <LoadingButton
            style={[styles.button, styles.outlineBtn]}
            textStyle={styles.outlineBtnText}
            isLoading={checking}
            onPress={refreshVerification}
            title="Already verified? Refresh"
            accessibilityLabel="Refresh verification status"
          />
          <TouchableOpacity
            style={[styles.button, styles.outlineBtn]}
            onPress={changeAccount}
            accessibilityLabel="Change account"
            activeOpacity={0.8}
          >
            <Text style={styles.outlineBtnText}>Change account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f8fa" },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.03,
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    alignSelf: "flex-start",
    width: "100%",
  },
  info: {
    fontSize: 17,
    color: "#444",
    marginBottom: 10,
    alignSelf: "flex-start",
    width: "100%",
  },
  email: { fontWeight: "bold", color: "#007AFF" },
  info2: {
    fontSize: 16,
    color: "#888",
    marginBottom: 15,
    marginTop: 5,
    alignSelf: "flex-start",
    width: "100%",
  },
  illustration: {
    width: width * 0.7,
    height: width * 0.75,
    marginBottom: 22,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
    marginBottom: 5,
  },
  button: {
    width: "100%",
    height: 54,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
    flexDirection: "row",
  },
  primaryBtn: {
    backgroundColor: "#007AFF",
    borderWidth: 0,
    marginBottom: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  outlineBtn: {
    backgroundColor: "#f6f8fa",
    borderWidth: 1.5,
    borderColor: "#007AFF",
  },
  outlineBtnText: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
