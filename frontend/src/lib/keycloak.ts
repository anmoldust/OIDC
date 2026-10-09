import Keycloak from 'keycloak-js';

/**
 * Singleton Keycloak instance.
 * Using a singleton prevents multiple initializations across React strict-mode re-renders.
 */
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

export default keycloak;
