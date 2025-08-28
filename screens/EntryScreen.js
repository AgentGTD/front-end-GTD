import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Linking, SafeAreaView, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import GoogleSignInButton from '../components/Auth/GoogleSignInButton';
import FacebookSignInButton from '../components/Auth/FacebookSignInButton';

const { width, height } = Dimensions.get('window');

// Responsive sizing helpers and clamped constants
const guidelineBaseWidth = 390; // iPhone 12 width baseline
const scaleSize = (size) => Math.round((width / guidelineBaseWidth) * size);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const HEADLINE_FONT = clamp(scaleSize(26), 20, 26);
const SUBHEAD_FONT = clamp(scaleSize(19), 14, 19);
const BUTTON_TEXT_FONT = clamp(scaleSize(17), 14, 17);
const SIGNUP_TEXT_FONT = clamp(scaleSize(15), 13, 15);
const TERMS_FONT = clamp(scaleSize(12), 11, 12);
const CONTAINER_PADDING_TOP = clamp(Math.round(height * 0.07), 24, 48);

const EntryScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      // Exit app on EntryScreen
      BackHandler.exitApp();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return (
   <SafeAreaView style={styles.safe}>
    <View style={styles.container}>

      {/* Headline */}
      <Text allowFontScaling={false} style={styles.headline}>Focus on What Matters. Flow with Clarity</Text>
      {/* Subheading */}
      <Text allowFontScaling={false} style={styles.subheading}>Login to your FlowDo Account</Text>

      {/* Illustration */}
      <Image
        source={require('../assets/entry.png')} 
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Auth Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.emailBtn]}
          onPress={() => navigation.navigate('Login')}
        >
          <MaterialIcons name="email" size={26} color="#fff" style={styles.icon} />
          <Text allowFontScaling={false} style={styles.buttonText}>Continue with Email</Text>
        </TouchableOpacity>

        <GoogleSignInButton />
       {/* <FacebookSignInButton /> */}
      </View>

      {/* Sign Up Link */}
      <TouchableOpacity style={styles.signupLinkContainer} onPress={() => navigation.navigate('Register')}>
        <Text allowFontScaling={false} style={styles.signupLinkText}>Don't have an account? <Text allowFontScaling={false} style={styles.signupLink}>Sign up</Text></Text>
      </TouchableOpacity>

      {/* Terms & Privacy */}
      <Text allowFontScaling={false} style={styles.termsText}>
        By continuing, you acknowledge that you understand and agree to FlowDo's{' '}
        <Text style={styles.link} onPress={() => Linking.openURL('https://flowdo-web.vercel.app/terms-of-service')}>Terms of Service</Text>
        {' '}and{' '}
        <Text style={styles.link} onPress={() => Linking.openURL('https://flowdo-web.vercel.app/privacy-policy')}>Privacy Policy</Text>.
      </Text>
    </View>
   </SafeAreaView>
  );
};

export default EntryScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f8fa" },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: clamp(width * 0.06, 16, 24),
    paddingTop: CONTAINER_PADDING_TOP,
    width: '100%',
  },
  headline: {
    fontSize: HEADLINE_FONT,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 5,
    width: '100%',
    paddingHorizontal: 24,
  },
  subheading: {
    fontSize: SUBHEAD_FONT,
    fontWeight: '600',
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 18,
    width: '100%',
  },
  illustration: {
    width: clamp(width * 0.8, 260, 360),
    height: clamp(width * 0.75, 220, 340),
    marginBottom: 10,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 5,
    marginBottom: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#007AFF',
    elevation: 0,
    shadowOpacity: 0,
  },
  emailBtn: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderColor: '#eee',
  },
  facebookBtn: {
    backgroundColor: '#fff',
    borderColor: '#eee',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: BUTTON_TEXT_FONT,
    fontWeight: '600',
    color: '#fff',
  },
  signupLinkContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  signupLinkText: {
    fontSize: SIGNUP_TEXT_FONT,
    color: '#888',
  },
  signupLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  termsText: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    fontSize: TERMS_FONT,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
