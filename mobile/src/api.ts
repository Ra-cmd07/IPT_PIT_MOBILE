import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateOrderRequest, MenuItem, Order, OrderStatus, UserProfile } from './types';
import Constants from 'expo-constants';

// ============================================================================
// API Configuration for Expo (LAN vs Tunnel Mode)
// ============================================================================
// IMPORTANT:
// - Use the backend host reachable from your device.
// - For Expo Tunnel mode, expose your local Django backend via a tunnel service
//   or public URL and set `expo.extra.apiBase` in mobile/app.json.
// - If `expo.extra.apiBase` is missing, the app falls back to the detected
//   Expo debugger host or the hardcoded LAN address below.
// ============================================================================

const DEFAULT_LAN_IP = '192.168.1.62';
const appConfig = (Constants as any).expoConfig ?? (Constants as any).manifest ?? {};
const customApiBase = appConfig?.extra?.apiBase as string | undefined;

let detectedHost = DEFAULT_LAN_IP;

try {
  const cfg = (Constants as any).expoConfig ?? (Constants as any).manifest ?? (Constants as any).manifest2;
  let dbg: string | undefined;
  if (cfg) {
    dbg = cfg.debuggerHost || cfg.host || cfg.hostUri;
  }
  dbg = dbg || (Constants as any).manifest2?.debuggerHost || (Constants as any).manifest?.debuggerHost;
  if (dbg && typeof dbg === 'string') {
    detectedHost = dbg.split(':')[0];
  }
} catch (e) {
  // ignore and fallback to DEFAULT_LAN_IP
}

const defaultApiBase = `http://${detectedHost}:8000/api`;
const API_BASE = customApiBase?.trim() || defaultApiBase;

// Debug logging
if (__DEV__) {
  console.log('🔌 API Configuration:', {
    customApiBase,
    detectedHost,
    API_BASE,
  });
}

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

const getStoredToken = async () => {
  const token = await AsyncStorage.getItem(ACCESS_KEY);
  return token;
};

const getStoredRefreshToken = async () => {
  const token = await AsyncStorage.getItem(REFRESH_KEY);
  return token;
};

const saveTokens = async (access: string, refresh: string) => {
  await AsyncStorage.setItem(ACCESS_KEY, access);
  await AsyncStorage.setItem(REFRESH_KEY, refresh);
};

const clearTokens = async () => {
  await AsyncStorage.removeItem(ACCESS_KEY);
  await AsyncStorage.removeItem(REFRESH_KEY);
};

const parseResponse = async (response: Response): Promise<any> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

const apiCall = async (url: string, options: ApiOptions = {}): Promise<any> => {
  const token = await getStoredToken();
  const { skipAuth, ...fetchOptions } = options;
  // Normalize headers into a plain object so we can safely assign by key
  const headers: Record<string, string> = {};
  if (options.headers) {
    // Handle Headers instance
    if (typeof (options.headers as any).forEach === 'function') {
      try {
        (options.headers as any).forEach((value: string, key: string) => {
          headers[key] = String(value);
        });
      } catch {
        // fallback to shallow copy
        Object.assign(headers, options.headers as Record<string, string>);
      }
    } else if (Array.isArray(options.headers)) {
      (options.headers as [string, string][]).forEach(([k, v]) => { headers[k] = String(v); });
    } else {
      Object.assign(headers, options.headers as Record<string, string>);
    }
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth && token) {
    headers['Authorization'] = `JWT ${token}`;
  }

  let response: Response;
  try {
    console.log('📤 API Request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!token,
    });
    response = await fetch(url, {
      ...options,
      headers,
    });
    console.log('📥 API Response:', { url, status: response.status });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ API Network Error:', { url, message });
    throw new Error(
      `Network request failed connecting to ${url}. ${message}. ` +
      `Ensure the backend host is reachable from your device or set expo.extra.apiBase in mobile/app.json.`
    );
  }

  if (response.status === 401) {
    const refreshToken = await getStoredRefreshToken();
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_BASE}/auth/jwt/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        await saveTokens(refreshData.access, refreshToken);
        return apiCall(url, options);
      }
    }
    await clearTokens();
    throw new Error('Unauthorized. Please sign in again.');
  }

  if (!response.ok) {
    const data = await parseResponse(response);
    const message = typeof data === 'object' && data !== null
      ? JSON.stringify(data)
      : data || response.statusText;
    console.error('❌ API Error Response:', { url, status: response.status, message });
    throw new Error(`API error: ${message}`);
  }

  return parseResponse(response);
};

export const login = async (email: string, password: string) => {
  const response = await apiCall(`${API_BASE}/auth/users/login/`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.access && response.refresh) {
    await saveTokens(response.access, response.refresh);
  }
  return response;
};

export const register = async (payload: Record<string, any>) => {
  return apiCall(`${API_BASE}/auth/users/register/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const activateAccount = async (uid: string, token: string) => {
  return apiCall(`${API_BASE}/auth/users/activation/`, {
    method: 'POST',
    body: JSON.stringify({ uid, token }),
    skipAuth: true,
  });
};

export const getProfile = async (): Promise<UserProfile> => {
  return apiCall(`${API_BASE}/auth/users/profile/`);
};

export const updateProfile = async (payload: Record<string, any>) => {
  return apiCall(`${API_BASE}/auth/users/profile/update/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const getMenuItems = async (availableOnly = true): Promise<MenuItem[]> => {
  const endpoint = availableOnly ? `${API_BASE}/menu/?available=true` : `${API_BASE}/menu/`;
  const response = await apiCall(endpoint);
  return Array.isArray(response.results) ? response.results : (Array.isArray(response) ? response : []);
};

export const createMenuItem = async (data: Partial<MenuItem>) => {
  return apiCall(`${API_BASE}/menu/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMenuItem = async (id: number, data: Partial<MenuItem>) => {
  return apiCall(`${API_BASE}/menu/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteMenuItem = async (id: number) => {
  return apiCall(`${API_BASE}/menu/${id}/`, {
    method: 'DELETE',
  });
};

export const toggleMenuItemAvailability = async (id: number, isAvailable: boolean) => {
  return apiCall(`${API_BASE}/menu/${id}/toggle-availability/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_available: isAvailable }),
  });
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await apiCall(`${API_BASE}/orders/`);
  return Array.isArray(response.results) ? response.results : (Array.isArray(response) ? response : []);
};

export const createOrder = async (payload: CreateOrderRequest) => {
  return apiCall(`${API_BASE}/orders/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
  return apiCall(`${API_BASE}/orders/${orderId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const sendChatbotMessage = async (message: string, sessionId: string) => {
  return apiCall(`${API_BASE}/chatbot/`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  });
};

export const logout = async () => {
  await clearTokens();
};

export const getAccessToken = getStoredToken;
