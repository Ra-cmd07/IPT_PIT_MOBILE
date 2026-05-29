import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  AppTabs: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Activation: undefined;
};
import ActivationScreen from '../screens/ActivationScreen';
import ChatScreen from '../screens/ChatScreen';
import LoginScreen from '../screens/LoginScreen';
import MenuAdminScreen from '../screens/MenuAdminScreen';
import OrderFormScreen from '../screens/OrderFormScreen';
import OrderQueueScreen from '../screens/OrderQueueScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#ffffff',
        tabBarStyle: { backgroundColor: '#0f172a' },
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen name="Queue" component={OrderQueueScreen} options={{ title: 'Kitchen Queue' }} />
      <Tab.Screen name="CreateOrder" component={OrderFormScreen} options={{ title: 'Create Order' }} />
      <Tab.Screen name="Menu" component={MenuAdminScreen} options={{ title: 'Menu' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="AppTabs" component={AppTabs} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Activation" component={ActivationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
