import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import keycloak from '../lib/keycloak';

interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: KeycloakUser | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider initializes Keycloak with check-sso silent login.
 * Wraps the entire app to provide authentication context.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Guard against React Strict Mode double-init
    if (initialized.current) return;
    initialized.current = true;

    const updateUserState = () => {
      if (keycloak.authenticated && keycloak.tokenParsed) {
        const parsed = keycloak.tokenParsed as Record<string, unknown>;
        const realmRoles = (parsed['realm_access'] as { roles?: string[] })?.roles ?? [];

        setUser({
          id: parsed['sub'] as string,
          username: parsed['preferred_username'] as string,
          email: parsed['email'] as string,
          firstName: parsed['given_name'] as string,
          lastName: parsed['family_name'] as string,
          roles: realmRoles,
        });
        setToken(keycloak.token ?? null);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    };

    keycloak.onAuthSuccess = updateUserState;
    keycloak.onAuthRefreshSuccess = updateUserState;
    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    };

    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        updateUserState();

        // Strip the OAuth #state=... fragment from URL to prevent hash routing jumps
        if (window.location.hash && window.location.hash.includes('state=')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        setIsInitialized(true);
      })
      .catch((err) => {
        console.error('Keycloak init failed', err);
        setIsInitialized(true);
      });

    // Keep token state fresh after refresh
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then(() => {
        setToken(keycloak.token ?? null);
        updateUserState();
      });
    };
  }, []);

  const login = () => keycloak.login({ redirectUri: `${window.location.origin}/dashboard` });
  const logout = () =>
    keycloak.logout({ redirectUri: window.location.origin });

  const hasRole = (role: string) => user?.roles.includes(role) ?? false;
  const hasAnyRole = (roles: string[]) => roles.some((r) => hasRole(r));

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isInitialized, user, token, login, logout, hasRole, hasAnyRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
