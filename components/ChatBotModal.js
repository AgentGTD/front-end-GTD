import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, ToastAndroid,  Clipboard } from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { sendAIPrompt } from '../utils/aiApi';
import Markdown from 'react-native-markdown-display';
import { useTaskContext } from '../context/TaskContext';

const ChatBotModal = ({ visible, onClose, token }) => {
  const { refreshAll } = useTaskContext();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm Atom. Your Personal Productivity Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

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

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setInputHeight(40);
    setIsLoading(true);

    // Show typing indicator
    setMessages((prev) => [...prev, { role: 'assistant', content: '...' }]);

    try {
      const data = await sendAIPrompt(userMessage.content, token);
      const assistantReply = data.message || data.result || "Sorry, I didn't understand that.";

      // Typing animation ( can be improved with better UX in future )
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
      console.error(err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Something went wrong.' }
      ]);
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    Clipboard.setString(text);
    if (Platform.OS === 'android') { // need to implement for iOS too ( copy acknowledgement )
      ToastAndroid.show('Copied!', ToastAndroid.SHORT);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ATOM</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={{ paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.message,
                msg.role === 'user' ? styles.user : styles.assistant,
              ]}
            >
              {msg.role === 'assistant' ? (
                <>
                  <Markdown
                    style={{
                      body: { color: '#222', fontSize: 15 },
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
                        <MaterialCommunityIcons name="content-copy" size={18} color="#888" />
                        <Text style={styles.copyText}>Copy</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.userText}>{msg.content}</Text>
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
              onPress={handleSend}
              style={[
                styles.sendButton,
                input.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="send" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 44 : 45, 
  },
  header: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  headerTitle: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  message: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 14,
    maxWidth: '85%',
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#f1f1f1',
    borderTopRightRadius: 4,
  },
  assistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userText: {
    color: '#222',
    fontSize: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: -4,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'start',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  copyText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 0,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: Platform.OS === 'ios' ? 8 : 10,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    color: '#222',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'transparent',

  },
  sendButton: {
    marginLeft: 4,
    padding: 7,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#d1d5db',
  },
});

export default ChatBotModal;
