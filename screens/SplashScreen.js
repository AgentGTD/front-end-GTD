import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo1.png')} 
        style={styles.logo}
        resizeMode="contain"
        // Add error handling to prevent crashes
        onError={(error) => console.log('Logo load error:', error)}
      />
      <ActivityIndicator size="large" color="#007AFF" style={styles.indicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    // Optimize logo size for mobile devices
    width: Math.min(width * 0.6, 200), // Responsive width, max 200px
    height: Math.min(height * 0.3, 200), // Responsive height, max 200px
    // Ensure logo doesn't exceed screen bounds
    maxWidth: '80%',
    maxHeight: '40%',
  },
  indicator: {
    position: 'absolute',
    bottom: height * 0.15, // Responsive positioning
  },
});
