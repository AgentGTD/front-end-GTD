import React from 'react';
import { ActivityIndicator as RNActivityIndicator, StyleSheet, View } from 'react-native';

const ActivityIndicator = ({ size = 'large', color = '#007AFF' }) => (
  <View style={styles.container}>
    <RNActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActivityIndicator;
