import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../utils/firebase";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export default function GoogleSignInButton() {
  const [ response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: `${GOOGLE_CLIENT_ID}.apps.googleusercontent.com`,
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return (
    <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
       <Image
         source={require("../../assets/google.png")}
         style={styles.icon}
         resizeMode="contain"
       />
      <Text style={[styles.text, { color: "#000" }]}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    marginVertical: 8,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#aaa",
  },
  icon: { marginRight: 12, width: 26, height: 26 },
  text: { fontSize: 17, fontWeight: "600" },
});