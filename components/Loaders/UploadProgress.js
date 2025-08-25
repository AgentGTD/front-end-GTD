import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UploadProgress({ progress = 0 }) {
  return (
    <View style={styles.container}>
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  outerCircle: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
});
