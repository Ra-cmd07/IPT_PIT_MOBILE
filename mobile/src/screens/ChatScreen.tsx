import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendChatbotMessage } from '../api';

interface ChatMessage {
  id: string;
  userMessage: string;
  botResponse: string;
  createdAt: string;
}

const SESSION_KEY = 'chat_session_id';

const ChatScreen = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        if (stored) {
          setSessionId(stored);
        } else {
          const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
          await AsyncStorage.setItem(SESSION_KEY, newId);
          setSessionId(newId);
        }
      } catch (error) {
        console.warn('Failed to load chat session', error);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !sessionId) return;
    const messageText = input.trim();
    setInput('');
    setLoading(true);

    const tempMessageId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempMessageId,
        userMessage: messageText,
        botResponse: '...',
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const data = await sendChatbotMessage(messageText, sessionId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? { ...msg, botResponse: data.message || 'No response from bot.' }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? {
                ...msg,
                botResponse:
                  'Sorry, there was a problem sending your message. Please try again.',
              }
            : msg
        )
      );
      console.error('Chat send error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Customer Support</Text>
        <Text style={styles.subtitle}>Ask questions about orders, menu, or app issues.</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Welcome to Support</Text>
            <Text style={styles.emptyText}>
              Type your question below and our chatbot will answer.
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View key={message.id} style={styles.messageBlock}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{message.userMessage}</Text>
              </View>
              <View style={styles.botBubble}>
                <Text style={styles.botText}>{message.botResponse}</Text>
              </View>
            </View>
          ))
        )}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#0ea5e9" />
            <Text style={styles.loadingText}>Waiting for response...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, (loading || !input.trim()) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 4,
    fontSize: 14,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyState: {
    marginTop: 40,
    paddingHorizontal: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  messageBlock: {
    marginBottom: 18,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    maxWidth: '80%',
  },
  userText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
  },
  botText: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#0ea5e9',
  },
  sendButtonDisabled: {
    backgroundColor: '#475569',
  },
  sendText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  loadingText: {
    color: '#94a3b8',
    marginLeft: 8,
  },
});

export default ChatScreen;
