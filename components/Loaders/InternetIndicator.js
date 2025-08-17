import React, { useEffect, useState, useRef } from 'react';
import {  Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const InternetIndicator = () => {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const isOffline = netInfo.isInternetReachable === false;
    if (isOffline) {
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    }
  }, [netInfo.isInternetReachable, slideAnim]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[
      styles.container,
      { top: insets.top, transform: [{ translateY: slideAnim }] },
    ]}>
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#007AFF',
    padding: 12,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default InternetIndicator;