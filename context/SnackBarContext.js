import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Text } from 'react-native-paper'; // Import Text from react-native-paper

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [onAction, setOnAction] = useState(null);
  const [duration, setDuration] = useState(3000);

  const showSnackbar = (msg, action = null, label = 'Undo', dur = 35000) => {
    setMessage(msg);
    setActionLabel(label);
    setOnAction(() => action);
    setDuration(dur);
    setVisible(true);
  };

  const hideSnackbar = () => {
    setVisible(false);
    // Reset after animation completes
    setTimeout(() => {
      setMessage('');
      setActionLabel('');
      setOnAction(null);
    }, 300);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={duration}
        action={{
          label: actionLabel,
          onPress: () => {
            if (onAction) onAction();
            hideSnackbar();
          },
          labelStyle: { color: '#007AFF', fontWeight: 'bold' },
        }}
        style={{ backgroundColor: '#222', marginBottom: 220, marginLeft: 15, borderRadius: 8 }}
      >
        <Text style={{ fontWeight: 'bold', color: '#fff' }}>{message}</Text>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);