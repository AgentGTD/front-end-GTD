import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function TaskCompletion() {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <AntDesign name="check" size={48} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  circle: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: '#4CD964',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
