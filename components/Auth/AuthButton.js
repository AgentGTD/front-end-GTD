import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const AuthButton = ({ onPress, label }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'center'
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default AuthButton;
