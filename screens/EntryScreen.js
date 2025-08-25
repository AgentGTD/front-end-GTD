import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Dimensions, Linking, SafeAreaView, BackHandler, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import GoogleSignInButton from '../components/Auth/GoogleSignInButton';
import FacebookSignInButton from '../components/Auth/FacebookSignInButton';

const { width, height } = Dimensions.get('window');

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
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Headline */}
      <Text style={styles.headline}>Focus on What Matters. Flow with Clarity</Text>
      {/* Subheading */}
      <Text style={styles.subheading}>Login to your FlowDo Account</Text>

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
          <Text style={styles.buttonText}>Continue with Email</Text>
        </TouchableOpacity>

        <GoogleSignInButton />
       {/* <FacebookSignInButton /> */}
      </View>

      {/* Sign Up Link */}
      <TouchableOpacity style={styles.signupLinkContainer} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.signupLinkText}>Don't have an account? <Text style={styles.signupLink}>Sign up</Text></Text>
      </TouchableOpacity>

      {/* Terms & Privacy */}
      <Text style={styles.termsText}>
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
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.07,
    width: '100%',
  },
  headline: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 5,
    width: '100%',
    paddingHorizontal: 24,
  },
  subheading: {
    fontSize: 19,
    fontWeight: '600',
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 18,
    width: '100%',
  },
  illustration: {
    width: width * 0.8,
    height: width * 0.75,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  signupLinkContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  signupLinkText: {
    fontSize: 15,
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
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
