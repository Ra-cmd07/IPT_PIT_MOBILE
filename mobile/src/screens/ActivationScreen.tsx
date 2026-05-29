import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { activateAccount } from '../api';

export default function ActivationScreen() {
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!uid || !token) {
      Alert.alert('Validation', 'Please enter both UID and token to activate your account.');
      return;
    }

    setLoading(true);
    try {
      await activateAccount(uid.trim(), token.trim());
      Alert.alert('Activation successful', 'Your account is now active. Please sign in.');
    } catch (error: any) {
      Alert.alert('Activation failed', error?.message || 'Please check your activation details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Activate Account</Text>
      <TextInput
        style={styles.input}
        placeholder="UID"
        placeholderTextColor="#94a3b8"
        value={uid}
        onChangeText={setUid}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Token"
        placeholderTextColor="#94a3b8"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
      />
      <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handleActivate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Activating...' : 'Activate'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#020617',
  } as const,
  content: {
    padding: 24,
  } as const,
  title: {
    color: '#34d399',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 24,
  } as const,
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    color: '#ffffff',
    padding: 16,
    marginBottom: 16,
  } as const,
  primaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  } as const,
  disabledButton: {
    opacity: 0.65,
  } as const,
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  } as const,
};
