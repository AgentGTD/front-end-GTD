import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import * as Facebook from "expo-auth-session/providers/facebook";
import { FacebookAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../utils/firebase";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;   

export default function FacebookSignInButton() {
  const [response, promptAsync] = Facebook.useAuthRequest({
    clientId: `${FACEBOOK_APP_ID}`,
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      const credential = FacebookAuthProvider.credential(access_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return (
    <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
      <Image
        source={require("../../assets/facebook.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={[styles.text, { color: "#000" }]}>Continue with Facebook</Text>
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
  icon: { marginRight: 12, width: 30, height: 30 },
  text: { fontSize: 17, fontWeight: "600" },
});