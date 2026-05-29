import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('💥 ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: '#fff',
          }}
        >
          <View style={{ alignItems: 'center', gap: 16 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#d32f2f',
                textAlign: 'center',
              }}
            >
              Something went wrong
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.setState({ hasError: false, error: null });
              }}
              style={{
                backgroundColor: '#1976d2',
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}
