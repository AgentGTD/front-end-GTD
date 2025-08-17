import React, { createContext, useState, useContext, useMemo } from 'react';
import AuthFeedbackModal from '../components/Auth/AuthFeedbackModal';

const AuthFeedbackContext = createContext();

export const AuthFeedbackProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  const showAuthFeedback = (title, message, type = 'error') => {
    setModalState({ visible: true, title, message, type });
  };

  const hideAuthFeedback = () => {
    setModalState(prevState => ({ ...prevState, visible: false }));
  };

  const value = useMemo(() => ({
    showAuthFeedback,
    hideAuthFeedback,
  }), []);

  return (
    <AuthFeedbackContext.Provider value={value}>
      {children}
      <AuthFeedbackModal
        visible={modalState.visible}
        onClose={hideAuthFeedback}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </AuthFeedbackContext.Provider>
  );
};

export const useAuthFeedback = () => {
  const context = useContext(AuthFeedbackContext);
  if (!context) {
    throw new Error('useAuthFeedback must be used within an AuthFeedbackProvider');
  }
  return context;
};