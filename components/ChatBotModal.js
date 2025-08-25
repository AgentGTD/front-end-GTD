import React, { useState, useEffect, useRef, useContext } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ToastAndroid, Clipboard, Animated } from 'react-native'; 
import { Ionicons, MaterialCommunityIcons, Fontisto } from '@expo/vector-icons';
import { sendAIPrompt } from '../utils/aiApi';

import { useTaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';

const ChatBotModal = ({ visible, onClose }) => {
  const { refreshAll } = useTaskContext();
  const { getCurrentToken } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [firebaseToken, setFirebaseToken] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    const fetchFirebaseToken = async () => {
      try {
        const token = await getCurrentToken();
        setFirebaseToken(token);
      } catch (error) {
        console.error("Failed to get token:", error);
      }
    };
    
    if (visible) {
      fetchFirebaseToken();
    }
  }, [getCurrentToken, visible]);

  // Smooth slide animation
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, visible]);

  // Focus input when modal opens
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100); 
    }
  }, [visible]);

  // Show welcome message only if no user interaction
  useEffect(() => {
    if (!hasUserInteracted && visible) {
      setMessages([
        { 
          role: 'welcome', 
          content: "👋 Hi! I'm Atom, your personal productivity assistant. I can help you with tasks, projects, and staying organized. What can I do for you today?" 
        }
      ]);
    }
  }, [visible, hasUserInteracted]);

  // Check for restricted commands
  const containsRestrictedKeywords = (text) => {
    const restricted = [
      'delete', 'remove', 'destroy', 'erase', 'drop', 
      'truncate', 'wipe', 'clear', 'purge', 'reset',
      'shutdown', 'grant', 'revoke'
    ];
    
    return restricted.some(keyword => 
      new RegExp(`\\b${keyword}\\b`, 'i').test(text)
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Check for restricted commands
    if (containsRestrictedKeywords(input)) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: input },
        { 
          role: 'assistant', 
          content: "I can't perform destructive actions like deleting data. For safety reasons, I'm limited to productivity tasks like creating and managing tasks, projects, and contexts (Instead you can do it manually)." 
        }
      ]);
      setInput('');
      return;
    }
    
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setInputHeight(40);
    setIsLoading(true);
    setHasUserInteracted(true);

    // Remove welcome message if it exists
    setMessages((prev) => prev.filter(msg => msg.role !== 'welcome'));

    // Show typing indicator
    setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);

    // Create abort controller for request cancellation
    abortControllerRef.current = new AbortController();

    try {
      const data = await sendAIPrompt(
        firebaseToken, 
        userMessage.content, 
        abortControllerRef.current.signal
      );
      
      let assistantReply = data.message || "Sorry, I didn't understand that.";
      
      // Handle backend security flags
      if (data.intent === 'error' || data.safe === false) {
        assistantReply = "I can't help with that request. For security reasons, I'm limited to productivity-related tasks.";
      }
      
      // Populate with actual response
      
      // Typing animation
      let i = 0;
      let animatedText = '';
      const interval = setInterval(() => {
        if (i < assistantReply.length) {
          animatedText += assistantReply[i];
          i++;
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: animatedText },
          ]);
        } else {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 1);
      
      // After successful backend creation, refresh frontend data
      refreshAll();
    } catch (err) {
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      } 
      
      // Handle specific error cases
      if (err.message?.includes('rate limit exceeded') || err.message?.includes('Too many requests') || err.response?.status === 429) {
        errorMessage = "I'm getting too many requests right now. Please wait a moment and try again.";
        setRateLimited(true);
        setTimeout(() => setRateLimited(false), 60000); // 1 minute cooldown
      }
      // Handle authentication errors
      else if (err.message?.includes('authentication failed') || err.message?.includes('access forbidden') || err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "I can't perform that action. You might need to sign in again.";
      }
      // Handle server errors
      else if (err.message?.includes('internal server error') || err.response?.status === 500) {
        errorMessage = "I'm experiencing technical difficulties. Please try again in a moment.";
      }
      // Handle network errors
      else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = "Network connection issue. Please check your internet connection and try again.";
      }
      // Handle authorization errors (fallback)
      else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "I can't perform that action. You might need to sign in again.";
      }
      
      // Replace typing indicator with error message
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setMessages((prev) => prev.filter(msg => msg.content !== '...'));
  };

  const handleCopy = (text) => {
    Clipboard.setString(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copied!', ToastAndroid.SHORT);
    }
  };

  // Security notice for new users
  const SecurityNotice = () => (
    <View style={styles.securityNotice}>
      <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
      <Text style={styles.securityText}>
        For your security, I can&apos;t perform destructive actions
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          {
            opacity: slideAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              })
            }]
          }
        ]}
      >
        <View style={styles.modalWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Fontisto name="atom" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>ATOM</Text>
                <Text style={styles.headerSubtitle}>Productivity Assistant</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Security notice for new conversations */}
          {!hasUserInteracted && <SecurityNotice />}

          {/* Chat Area */}
          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={{ paddingBottom: 80 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageContainer,
                  msg.role === 'user' ? styles.userContainer : styles.assistantContainer,
                  msg.role === 'welcome' && styles.welcomeContainer,
                ]}
              >
                {msg.role === 'welcome' ? (
                  <View style={styles.welcomeMessage}>
                    <View style={styles.welcomeContent}>
                      <Text style={styles.welcomeTitle}>👋 Hi! I&apos;m Atom</Text>
                      <Text style={styles.welcomeSubtitle}>
                        Your personal productivity assistant. I can help you with:
                        {"\n\n"}- Creating tasks and projects
                        {"\n"}- Managing tasks and projects
                        {"\n"}- Organizing by contexts
                        {"\n"}- Planning your day
                        {"\n\n"}What can I do for you today?
                      </Text>
                    </View>
                  </View>
                ) : msg.role === 'user' ? (
                  <View style={styles.userMessage}>
                    <Text style={styles.userText}>{msg.content}</Text>
                  </View>
                ) : (
                  <View style={styles.assistantMessage}>
                    <View style={styles.assistantAvatar}>
                      <Text style={styles.assistantAvatarText}>A</Text>
                    </View>
                    <View style={styles.assistantContent}>
                      <Text style={styles.assistantText}>
                        {msg.content}
                      </Text>
                      {msg.content !== '...' && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={() => handleCopy(msg.content)}
                          >
                            <MaterialCommunityIcons name="content-copy" size={16} color="#888" />
                            <Text style={styles.copyText}>Copy</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputWrapper}
          >
            <View style={styles.inputBox}>
              <TextInput
                ref={inputRef}
                value={input}
                onChangeText={setInput}
                multiline
                onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                placeholder="Ask Atom anything about productivity..."
                placeholderTextColor="#888"
                style={[styles.input, { height: Math.max(40, Math.min(inputHeight, 120)) }]}
                editable={!isLoading && !rateLimited}
                onSubmitEditing={rateLimited ? undefined : handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={isLoading ? handleCancel : (rateLimited ? undefined : handleSend)}
                style={[
                  styles.sendButton,
                  input.trim() && !isLoading && !rateLimited ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                disabled={(!input.trim() && !isLoading) || rateLimited}
              >
                {isLoading ? (
                  <Ionicons name="stop" size={20} color="#fff" />
                ) : rateLimited ? (
                  <Ionicons name="time-outline" size={20} color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            {rateLimited && (
              <Text style={styles.rateLimitText}>
                Too many requests. Please wait a moment...
              </Text>
            )}
          </KeyboardAvoidingView>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50,
  },
  header: {
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  securityText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 8,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  messageContainer: {
    marginVertical: 8,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  welcomeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    maxWidth: '90%',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderTopRightRadius: 4,
    maxWidth: '80%',
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  assistantMessage: {
    flexDirection: 'row',
    maxWidth: '95%',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  assistantAvatarText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  assistantContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 18,
    borderTopLeftRadius: 4,
  },
  assistantText: {
    color: '#222',
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  copyText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 20,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingRight: 8,
    paddingLeft: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#222',
    fontSize: 15,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  sendButton: {
    marginLeft: 4,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#d1d5db',
  },
  rateLimitText: {
    color: '#F44336',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});

export default ChatBotModal;