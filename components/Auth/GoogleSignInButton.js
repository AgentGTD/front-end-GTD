import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../utils/firebase";

const GOOGLE_CLIENT_ID_ANDROID = process.env.GOOGLE_CLIENT_ID_ANDROID;
//const GOOGLE_CLIENT_ID_IOS = process.env.GOOGLE_CLIENT_ID_IOS;
//const GOOGLE_CLIENT_ID_WEB = process.env.GOOGLE_CLIENT_ID_WEB;

export default function GoogleSignInButton() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID_ANDROID,
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return (
    <TouchableOpacity
      style={styles.button}
      disabled={!request}
      onPress={() => promptAsync()}
    >
      <Image
        source={require("../../assets/google.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={[styles.text, { color: "#000" }]}>
        Continue with Google
      </Text>
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
