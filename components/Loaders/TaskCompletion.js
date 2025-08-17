import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { AntDesign } from '@expo/vector-icons';

export default function TaskCompletion() {
  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      >
        <View style={styles.circle}>
          <AntDesign name="check" size={48} color="#fff" />
        </View>
      </MotiView>
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
