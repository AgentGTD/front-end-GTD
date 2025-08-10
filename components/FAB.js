import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Fontisto from '@expo/vector-icons/Fontisto';

const FAB = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Fontisto name="atom" size={28} color="#fff" />
    </TouchableOpacity>
  );
};

export default FAB;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
