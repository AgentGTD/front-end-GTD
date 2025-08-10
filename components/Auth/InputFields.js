import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

const InputField = ({ placeholder, secureTextEntry, value, onChangeText }) => (
  <View style={styles.inputWrapper}>
    <TextInput
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      placeholderTextColor="#999"
    />
  </View>
);

const styles = StyleSheet.create({
  inputWrapper: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
  },
  input: {
    height: 48,
    fontSize: 16,
    color: '#000'
  }
});

export default InputField;
