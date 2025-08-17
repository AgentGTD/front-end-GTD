import React, { createContext, useContext, useState, useMemo } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Modal } from 'react-native';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showLoader = (msg = 'Loading...') => {
    setMessage(msg);
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
    setMessage('');
  };

  const value = useMemo(() => ({ showLoader, hideLoader }), []);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Modal transparent animationType="fade" visible={loading}>
        <View style={styles.overlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            {!!message && <Text style={styles.message}>{message}</Text>}
          </View>
        </View>
      </Modal>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 180,
  },
  message: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
