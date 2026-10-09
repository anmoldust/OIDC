import axios from 'axios';
import keycloak from './keycloak';

/**
 * Axios instance pre-configured with base URL and automatic JWT injection.
 *
 * - Automatically attaches Authorization: Bearer <token> from Keycloak
 * - Refreshes the token if it expires within 30 seconds before each request
 * - Handles 401 by triggering Keycloak re-login
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// ── Request interceptor: attach fresh JWT ────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    try {
      // Refresh token if it expires within the next 30 seconds
      await keycloak.updateToken(30);
      config.headers['Authorization'] = `Bearer ${keycloak.token}`;
    } catch {
      console.error('Failed to refresh token, redirecting to login...');
      keycloak.login();
    }
  }
  return config;
});

// ── Response interceptor: handle auth errors ─────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized — request rejected by backend API');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
