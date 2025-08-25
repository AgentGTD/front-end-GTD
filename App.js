import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TaskProvider } from './context/TaskContext';
import { ChatBotProvider, useChatBot } from './context/ChatBotContext';
import ChatBotModal from './components/ChatBotModal';
import { SnackbarProvider } from './context/SnackBarContext';
import SplashScreen from './screens/SplashScreen';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { View, Platform, StatusBar as RNStatusBar, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import InternetIndicator from './components/Loaders/InternetIndicator';
import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
//import ProfileSetupScreen from './screens/ProfileSetupScreen';
//import EmailVerificationScreen from './screens/EmailVerificationScreen';
import { LoadingProvider } from './context/LoadingContext';
import { AuthFeedbackProvider } from './context/AuthFeedbackContext';

// Create a root stack navigator
const RootStack = createStackNavigator();

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>The app encountered an error. Please restart the app.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Firebase Error Fallback Component
function FirebaseErrorFallback({ error, onRetry }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Configuration Error</Text>
      <Text style={styles.errorMessage}>
        {error || 'Unable to initialize app configuration. Please check your internet connection and try again.'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function RootNavigator() {
  const { user, profile, initializing, firebaseError } = useContext(AuthContext);
  const { visible, closeChatBot } = useChatBot();
  const [hasError, setHasError] = useState(false);

  // Add error handling
  useEffect(() => {
    const handleError = (error) => {
      console.error('Navigation Error:', error);
      setHasError(true);
    };

    // Global error handler
    if (__DEV__) {
      console.log('🔍 Debug: RootNavigator render', { user, profile, initializing, firebaseError });
    }

    return () => {
      // Cleanup
    };
  }, [user, profile, initializing, firebaseError]);

  // Show Firebase error if initialization failed
  if (firebaseError) {
    return (
      <FirebaseErrorFallback 
        error={firebaseError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Navigation Error</Text>
        <Text style={styles.errorMessage}>Please restart the app.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setHasError(false)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        { !user ||  !user?.emailVerified ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) :  (
          <RootStack.Screen name="App" component={AppNavigator} />
        )}
      </RootStack.Navigator>
      <InternetIndicator />
      <ChatBotModal visible={visible} onClose={closeChatBot} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <TaskProvider>
            <ChatBotProvider>
              <SnackbarProvider>
                <LoadingProvider>
                  <AuthFeedbackProvider>
                    <NavigationContainer
                      onStateChange={(state) => {
                        if (__DEV__) {
                          console.log('🔍 Navigation State:', state);
                        }
                      }}
                      onError={(error) => {
                        console.error('Navigation Error:', error);
                      }}
                    >
                      <View style={{
                        height: Platform.OS === 'android' ? RNStatusBar.currentHeight : Constants.statusBarHeight,
                        backgroundColor: '#f6f8fa',
                      }} />
                      <RNStatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
                      <RootNavigator />
                    </NavigationContainer>
                  </AuthFeedbackProvider>
                </LoadingProvider>
              </SnackbarProvider>
            </ChatBotProvider>
          </TaskProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});