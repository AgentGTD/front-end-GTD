import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Text } from 'react-native-paper';

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [snackbarQueue, setSnackbarQueue] = useState([]);
  const [currentSnackbar, setCurrentSnackbar] = useState(null);

  const showSnackbar = (msg, action = null, label = 'Undo', dur = 3500) => {
    const newSnackbar = {
      id: Date.now(),
      message: msg,
      actionLabel: label,
      onAction: action,
      duration: dur
    };
    setSnackbarQueue(prev => [...prev, newSnackbar]);
  };

  // Whenever queue changes and no snackbar is shown, show the next
  useEffect(() => {
    if (!currentSnackbar && snackbarQueue.length > 0) {
      setCurrentSnackbar(snackbarQueue[0]);
      setSnackbarQueue(prev => prev.slice(1));
    }
  }, [snackbarQueue, currentSnackbar]);

  const hideSnackbar = () => {
    setCurrentSnackbar(null);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {currentSnackbar && (
        <Snackbar
          visible
          onDismiss={hideSnackbar}
          duration={currentSnackbar.duration}
          action={{
            label: currentSnackbar.actionLabel,
            onPress: () => {
              currentSnackbar.onAction?.();
              hideSnackbar();
            },
            labelStyle: { color: '#007AFF', fontWeight: 'bold' },
          }}
          style={{
            backgroundColor: '#222',
            marginHorizontal: 15,
            borderRadius: 8,
            position: 'absolute',
            bottom: 200,
            left: 0,
            right: 0,
            zIndex: 999
          }}
        >
          <Text style={{ fontWeight: 'bold', color: '#fff' }}>
            {currentSnackbar.message}
          </Text>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
