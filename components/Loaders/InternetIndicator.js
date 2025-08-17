import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function InternetIndicator() {
  const { loading, isConnected } = useContext(AuthContext);

  if (!loading && isConnected) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        {isConnected ? (
          <>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.text}>Getting your tasks ready</Text>
          </>
        ) : (
          <>
            <Ionicons name="wifi-off" size={30} color="#fff" />
            <Text style={styles.text}>No Internet Connection</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  box: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    maxWidth: '80%',
  },
  text: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});
