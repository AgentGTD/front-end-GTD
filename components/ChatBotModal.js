import React, { useState, useEffect, useRef, useContext } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ToastAndroid, Clipboard, Animated } from 'react-native'; 
import { Ionicons, MaterialCommunityIcons, Fontisto } from '@expo/vector-icons';
import { sendAIPrompt } from '../utils/aiApi';
import Markdown from 'react-native-markdown-display';
import { useTaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';



const ChatBotModal = ({visible, onClose }) => {
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

  useEffect(() => {
    const fetchFirebaseToken = async () => {
      const token = await getCurrentToken();
      setFirebaseToken(token);
    };
    fetchFirebaseToken();
  }, [getCurrentToken]);



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
          content: "👋 Hi! I'm Atom. Your Personal Productivity Assistant. How can I help you today?" 
        }
      ]);
    }
  }, [visible, hasUserInteracted]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
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
      const data = await sendAIPrompt(firebaseToken, userMessage.content, abortControllerRef.current.signal);
      const assistantReply = data.message || data.result || "Sorry, I didn't understand that.";

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
      if (err.name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error(err);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: 'Something went wrong.' }
        ]);
      }
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
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

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
                      <Text style={styles.welcomeTitle}>👋 Hi! I am Atom</Text>
                      <Text style={styles.welcomeSubtitle}>Your Personal Productivity Assistant. How can I help you today?</Text>
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
                      <Markdown
                        style={{
                          body: { color: '#222', fontSize: 15, lineHeight: 22 },
                          heading1: { color: '#222', fontWeight: 'bold', fontSize: 20, marginBottom: 6 },
                          heading2: { color: '#222', fontWeight: 'bold', fontSize: 17, marginBottom: 4 },
                          strong: { fontWeight: 'bold', color: '#222' },
                          bullet_list: { marginVertical: 4 },
                          ordered_list: { marginVertical: 4 },
                          list_item: { marginVertical: 2 },
                          code_inline: { backgroundColor: '#f6f8fa', color: '#7c4dff', borderRadius: 4, padding: 2 },
                          code_block: { backgroundColor: '#f6f8fa', color: '#7c4dff', borderRadius: 4, padding: 8 },
                          blockquote: { borderLeftColor: '#7c4dff', borderLeftWidth: 4, paddingLeft: 8, color: '#555' },
                        }}
                      >
                        {msg.content}
                      </Markdown>
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
                placeholder="Ask Atom anything"
                placeholderTextColor="#888"
                style={[styles.input, { height: Math.max(40, Math.min(inputHeight, 120)) }]}
                editable={!isLoading}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={isLoading ? handleCancel : handleSend}
                style={[
                  styles.sendButton,
                  input.trim() && !isLoading ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                disabled={!input.trim() && !isLoading}
              >
                {isLoading ? (
                  <Ionicons name="stop" size={20} color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
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
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  welcomeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  welcomeAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    maxWidth: '85%',
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
    marginBottom: 12,
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
});

export default ChatBotModal;
