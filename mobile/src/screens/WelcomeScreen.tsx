import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, Pressable } from 'react-native';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍳 Kitchen Queue</Text>
      <Text style={styles.subtitle}>Manage kitchen orders, menu items, and profile all in one place.</Text>
      <View style={styles.buttonGroup}>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.secondaryText}>Create Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  } as const,
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#34d399',
    textAlign: 'center',
    marginBottom: 16,
  } as const,
  subtitle: {
    color: '#cbd5e1',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 24,
  } as const,
  buttonGroup: {
    width: '100%',
    gap: 14,
  } as const,
  primaryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  } as const,
  secondaryButton: {
    borderColor: '#475569',
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  } as const,
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  } as const,
  secondaryText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
  } as const,
};
