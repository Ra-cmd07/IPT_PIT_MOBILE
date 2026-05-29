import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, login as apiLogin, logout as apiLogout, register as apiRegister } from '../api';
import { UserProfile } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch (error) {
      setUser(null);
      console.warn('Could not fetch profile on startup (expected if not logged in):', error);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        console.log('🔐 AuthContext: Checking for stored token...');
        // Only try to refresh profile if we have a stored token
        const hasToken = await AsyncStorage.getItem('access_token');
        console.log('🔐 AuthContext: Token exists?', !!hasToken);
        if (hasToken) {
          console.log('🔐 AuthContext: Fetching profile...');
          await refreshProfile();
          console.log('🔐 AuthContext: Profile fetched successfully');
        } else {
          console.log('🔐 AuthContext: No token, skipping profile fetch');
        }
      } catch (error) {
        console.error('🔐 AuthContext: Bootstrap error:', error);
        setUser(null);
      } finally {
        console.log('🔐 AuthContext: Auth ready!');
        setAuthReady(true);
      }
    };
    bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    await apiLogin(email, password);
    await refreshProfile();
  };

  const signUp = async (payload: Record<string, any>) => {
    await apiRegister(payload);
  };

  const signOut = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authReady, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
