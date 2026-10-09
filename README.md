# OIDC Demo - Production-Grade Full-Stack with Spring Boot and Keycloak

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Keycloak](https://img.shields.io/badge/Keycloak-25.0-4D9900?style=flat-square)](https://www.keycloak.org)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk)](https://adoptium.net)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com)

**A production-ready full-stack application demonstrating OIDC/OAuth2 security with Keycloak, Spring Boot, and React — complete with RBAC, rate limiting, monitoring, and Docker Compose deployment.**

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Security Design](#security-design)
- [Keycloak Configuration](#keycloak-configuration)
- [API Documentation](#api-documentation)
- [Frontend](#frontend)
- [Monitoring and Observability](#monitoring-and-observability)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)

---

## Features

| Category | Details |
|---|---|
| **OIDC Security** | Keycloak with Authorization Code + PKCE flow |
| **Dual Security** | JWT Resource Server (API) + OAuth2 Login (Web) |
| **RBAC** | ADMIN, MANAGER, USER roles via Spring Security @PreAuthorize |
| **Rate Limiting** | Token-bucket per-IP (Bucket4j, 100 req/min), RFC-compliant 429 |
| **API Docs** | Swagger UI with Keycloak OAuth2 Authorization Code integration |
| **Monitoring** | Spring Actuator + Prometheus + Grafana dashboards |
| **Token Refresh** | Automatic JWT refresh in React with Axios interceptors |
| **Database** | PostgreSQL + HikariCP pool, Spring Data JPA + MapStruct |
| **Docker** | Full Compose stack with health checks and ordered startup |
| **Frontend** | React + Vite + TypeScript with dark glassmorphism design |

---

## Architecture

```
+-------------------------------------------------------------------+
|                      Docker Compose Stack                         |
|                                                                   |
|  +---------------+   OIDC/PKCE   +----------------------------+  |
|  |   React SPA   |<------------->|   Keycloak 25 (Port 8180)  |  |
|  |  (Port 5173)  |               |   Realm: oidc-demo         |  |
|  +-------+-------+               +----------------------------+  |
|          | Bearer JWT                         ^ JWKS verify      |
|          v                                    |                   |
|  +-----------------------------------------------------------+   |
|  |         Spring Boot Backend (Port 8080)                   |   |
|  |  Chain 1: JWT Resource Server  (/api/**)                  |   |
|  |  Chain 2: OAuth2 Login         (/**)                      |   |
|  |  RateLimitingFilter: Bucket4j 100 req/min per IP          |   |
|  |  Controllers: /api/v1/users  /api/v1/admin  /api/v1/public|   |
|  +-------------------+---------------------------------------+   |
|                       | JPA/HikariCP                             |
|  +--------------------v-----------+                              |
|  |      PostgreSQL 16 (Port 5432) |                              |
|  +--------------------------------+                              |
|                                                                   |
|  +------------------+    +-------------------+                   |
|  | Prometheus (9090)|    |  Grafana  (3000)  |                   |
|  | scrapes /actuator|    |  dashboards       |                   |
|  +------------------+    +-------------------+                   |
+-------------------------------------------------------------------+
```

### OIDC Authentication Flow

```
Browser          React SPA            Spring Boot         Keycloak
   |                 |                     |                  |
   | Click Sign In   |                     |                  |
   |---------------->|                     |                  |
   |                 | Redirect (PKCE)     |                  |
   |                 |------------------------------------------------->|
   |                 | User logs in        |                  |
   |<-------------------------------------------------login page--------|
   |                 |                  code returned         |
   |                 |<--------------------------------------------------|
   |                 | Exchange code for tokens               |
   |                 |------------------------------------------------->|
   |                 |<---------access_token (JWT) + refresh_token------|
   |                 | API request with Bearer JWT             |
   |                 |-------------------->|                  |
   |                 |                     | Validate JWT locally (JWKS)|
   |                 |                     |<-----------------|
   |                 |<----Protected data--|                  |
```

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.3.4 | Core framework |
| Spring Security OAuth2 Resource Server | 6.3 | JWT validation (stateless) |
| Spring Security OAuth2 Client | 6.3 | OAuth2 Login (session) |
| Spring Data JPA | 3.3 | Database ORM |
| PostgreSQL | 16 | Primary relational database |
| HikariCP | 5.1 | Connection pool (pool-size: 20) |
| Bucket4j | 8.10 | Token-bucket rate limiting |
| SpringDoc OpenAPI | 2.6 | Swagger UI |
| MapStruct | 1.5.5 | Compile-time DTO mapping |
| Lombok | Latest | Boilerplate reduction |
| Micrometer + Prometheus | Latest | Metrics |
| Java | 21 (LTS) | Runtime |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Build tool and dev server |
| TypeScript | 5 | Type safety |
| Keycloak.js | 25 | OIDC client (PKCE S256) |
| TanStack React Query | 5 | Server state, caching, pagination |
| Axios | 1.7 | HTTP client with request interceptors |
| React Router | 6 | SPA routing and navigation |
| Lucide React | Latest | Icon set |

### Infrastructure

| Technology | Purpose |
|---|---|
| Keycloak 25 | Identity and Access Management |
| Docker + Docker Compose | Container orchestration |
| Nginx 1.27 | SPA static server + security headers |
| Prometheus | Time-series metrics collection |
| Grafana | Metrics visualization and dashboards |

---

## Project Structure

```
OIDC/
+-- backend/
|   +-- src/main/java/com/oidcdemo/backend/
|   |   +-- OidcBackendApplication.java        Entry point
|   |   +-- config/
|   |   |   +-- SecurityConfig.java            Dual security filter chains
|   |   |   +-- OpenApiConfig.java             Swagger with Keycloak OAuth2 scheme
|   |   +-- controller/
|   |   |   +-- UserController.java            /api/v1/users/** (CRUD + /me)
|   |   |   +-- AdminController.java           /api/v1/admin/** (ADMIN only)
|   |   |   +-- PublicController.java          /api/v1/public/** (no auth)
|   |   +-- filter/
|   |   |   +-- RateLimitingFilter.java        Bucket4j 100 req/min per IP
|   |   +-- service/
|   |   |   +-- UserService.java               Business logic + JWT provisioning
|   |   |   +-- UserSecurityService.java       SpEL @PreAuthorize helpers
|   |   +-- repository/
|   |   |   +-- UserRepository.java
|   |   +-- model/
|   |   |   +-- User.java                      JPA entity (UUID PK + Keycloak ID)
|   |   +-- dto/
|   |   |   +-- UserDto.java                   Sealed interface with Java records
|   |   |   +-- ApiError.java                  Standard JSON error response
|   |   +-- mapper/
|   |   |   +-- UserMapper.java                MapStruct compile-time mapper
|   |   +-- exception/
|   |       +-- GlobalExceptionHandler.java    Centralized @RestControllerAdvice
|   |       +-- ResourceNotFoundException.java
|   |       +-- ConflictException.java
|   +-- src/main/resources/
|   |   +-- application.yml                    Full config with env var overrides
|   +-- src/test/resources/
|   |   +-- application-test.yml               H2 in-memory test config
|   +-- Dockerfile                             Multi-stage Maven + JRE Alpine
|   +-- pom.xml                                Maven dependencies
|
+-- frontend/
|   +-- src/
|   |   +-- lib/
|   |   |   +-- keycloak.ts                   Singleton Keycloak instance
|   |   |   +-- apiClient.ts                  Axios with JWT interceptors + refresh
|   |   +-- contexts/
|   |   |   +-- AuthContext.tsx               Auth state, roles, login/logout hooks
|   |   +-- components/
|   |   |   +-- Navbar.tsx                    Role-aware responsive navbar
|   |   |   +-- ProtectedRoute.tsx            Route guard (auth + RBAC)
|   |   +-- pages/
|   |   |   +-- LoginPage.tsx                 Landing with Keycloak SSO button
|   |   |   +-- DashboardPage.tsx             User profile + JWT claims
|   |   |   +-- UsersPage.tsx                 Paginated user management table
|   |   |   +-- AdminPage.tsx                 Admin stats + audit log
|   |   |   +-- UnauthorizedPage.tsx          403 access denied page
|   |   +-- App.tsx                           Router, QueryClient, providers
|   |   +-- main.tsx                          React entry point
|   |   +-- index.css                         Dark glassmorphism design system
|   +-- public/
|   |   +-- silent-check-sso.html             Keycloak silent SSO iframe
|   +-- Dockerfile                            Node build + Nginx serve
|   +-- nginx.conf                            SPA fallback + security headers + gzip
|   +-- .env                                  Local dev environment
|   +-- .env.production                       Production environment
|
+-- keycloak/
|   +-- realm-export.json                     Realm config (auto-imported on startup)
|
+-- docker/
|   +-- prometheus.yml                        Prometheus scrape configuration
|
+-- docker-compose.yml                        Full stack (6 services)
+-- .gitignore
+-- README.md
```

---

## Quick Start

### Prerequisites

| Tool | Minimum Version | Where Used |
|---|---|---|
| Docker Desktop | 24+ | Docker Compose (all services) |
| Java JDK | 21 | Local backend development |
| Maven | 3.9+ | Local backend build |
| Node.js | 20+ | Local frontend development |

---

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/oidc-demo.git
cd oidc-demo

# 2. Start the entire stack
docker compose up --build
```

> **Note:** First startup takes approximately 2-3 minutes.
> Keycloak needs time to initialize and auto-import the realm from `keycloak/realm-export.json`.

**Service URLs:**

| Service | URL | Default Credentials |
|---|---|---|
| React Frontend | http://localhost:5173 | See Demo Users table |
| Spring Boot API | http://localhost:8080 | Bearer JWT required |
| Swagger UI | http://localhost:8080/swagger-ui.html | Authorize with Keycloak |
| Keycloak Admin | http://localhost:8180 | admin / admin |
| Prometheus | http://localhost:9090 | No auth |
| Grafana | http://localhost:3000 | admin / admin |

---

### Option 2: Local Development

#### Step 1 — Start Infrastructure

```bash
# Start Keycloak and PostgreSQL only
docker compose up postgres keycloak -d

# Wait for Keycloak to be ready
docker compose logs keycloak -f
# Ready when you see: "Keycloak 25.x.x on JVM (powered by Quarkus)"
```

#### Step 2 — Run the Backend

```bash
cd backend

# Start Spring Boot
./mvnw spring-boot:run
```

Backend starts at **http://localhost:8080**

#### Step 3 — Run the Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start Vite dev server
npm run dev
```

Frontend starts at **http://localhost:5173**

---

## Security Design

### Two Independent Security Chains

The backend uses Spring Security with **two ordered security filter chains**:

**Chain 1 — JWT Resource Server** (`@Order(1)`, matches `/api/**`)
- **Stateless** — no server-side session created
- Validates Keycloak JWTs locally using cached JWKS public keys
- Role extraction from `realm_access.roles` JWT claim
- Rate limiting filter applied before authentication

**Chain 2 — OAuth2 Login** (`@Order(2)`, matches everything else)
- Session-based OAuth2 Authorization Code flow
- Used by Swagger UI and any server-rendered pages
- Redirects to Keycloak login, stores session cookie

### JWT Token Validation

Spring Boot fetches Keycloak's JWKS (JSON Web Key Set) on startup and caches it.
Every JWT is validated **locally** — no network call to Keycloak per request:

```yaml
# application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${KEYCLOAK_ISSUER_URI}
          jwk-set-uri: ${KEYCLOAK_ISSUER_URI}/protocol/openid-connect/certs
```

Validations performed:
- **Signature** — using RSA public key from JWKS
- **Issuer** — must match configured `issuer-uri`
- **Expiry** — `exp` claim must be in the future
- **Not-before** — `nbf` claim respected

### Role Mapping

Keycloak includes realm roles in the JWT under `realm_access.roles`.
A custom `JwtGrantedAuthoritiesConverter` maps these to Spring `GrantedAuthority`:

```
JWT: { "realm_access": { "roles": ["ADMIN", "USER"] } }
  => Spring authorities: [ROLE_ADMIN, ROLE_USER]
```

### Access Control Matrix

| Endpoint | ADMIN | MANAGER | USER | Public |
|---|---|---|---|---|
| GET /api/v1/public/** | Yes | Yes | Yes | Yes |
| GET /api/v1/users/me | Yes | Yes | Yes | No |
| GET /api/v1/users | Yes | Yes | No | No |
| GET /api/v1/users/{id} | Yes | Yes | No | No |
| POST /api/v1/users | Yes | No | No | No |
| PUT /api/v1/users/{id} | Yes | No | Own only | No |
| DELETE /api/v1/users/{id} | Yes | No | No | No |
| GET /api/v1/admin/** | Yes | No | No | No |

The "own only" rule for PUT uses a SpEL expression:

```java
@PreAuthorize("hasRole('ADMIN') or @userSecurity.isSelf(#id, authentication)")
```

`@userSecurity` is a Spring bean that looks up the local user by UUID and compares the Keycloak subject.

### Rate Limiting

`RateLimitingFilter` applies before authentication using the **token-bucket** algorithm (Bucket4j):

```
Per IP: 100 tokens capacity, refill 100 per minute (greedy)
```

Response when limit exceeded:
```
HTTP 429 Too Many Requests
Retry-After: 60
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 0

{
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please wait 1 minute before retrying.",
  "retryAfterSeconds": 60
}
```

Proxy header support: resolves real IP from `X-Forwarded-For` and `X-Real-IP`.

### CORS Configuration

CORS is configured as a `CorsConfigurationSource` bean (not per-controller) to apply consistently across both security chains:

```yaml
# Configured in application.yml
app:
  allowed-origins:
    - http://localhost:5173
    - ${FRONTEND_URL}
```

Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`  
Credentials: `true` (required for OAuth2 cookie-based session)

---

## Keycloak Configuration

### Realm Auto-Import

The file `keycloak/realm-export.json` is mounted into the Keycloak container and
imported automatically on first startup via `--import-realm` flag. No manual Keycloak setup required.

### Realm Settings

| Setting | Value |
|---|---|
| Realm name | oidc-demo |
| SSL required | External requests only |
| Brute force protection | Enabled |
| Access token lifespan | 5 minutes |
| Refresh token | Enabled |

### Clients

**oidc-backend** (Confidential client — Spring Boot)
- Client authentication: ON
- Standard flow: ON
- Redirect URIs: `http://localhost:8080/*`
- Protocol mappers: Realm roles mapped to `realm_access.roles` in JWT

**oidc-frontend** (Public client — React SPA)
- Client authentication: OFF (no secret — safe for browser)
- Standard flow: ON with PKCE (code_challenge_method: S256)
- Redirect URIs: `http://localhost:5173/*`

> **Security note:** Never put a client secret in frontend code.
> The public client + PKCE combination is the secure alternative for SPAs.

### Demo Users

| Username | Password | Realm Roles | Access Level |
|---|---|---|---|
| admin | admin123 | ADMIN, USER | Full — all endpoints including admin |
| manager | manager123 | MANAGER, USER | Users list + own profile |
| user | user123 | USER | Own profile only |

---

## API Documentation

### Swagger UI

Navigate to: **http://localhost:8080/swagger-ui.html**

**To authenticate in Swagger UI:**
1. Click the **Authorize** button (padlock icon)
2. Select `keycloak_oauth2`
3. Set `client_id` to `oidc-frontend`
4. Check scopes: `openid`, `profile`, `email`, `roles`
5. Click Authorize — you will be redirected to Keycloak
6. Log in with a demo user
7. All API calls will now include the Bearer token

### Endpoints Reference

```
Public (no authentication required)
  GET  /api/v1/public/health         Health status
  GET  /api/v1/public/info           Application metadata

User Management (authentication required)
  GET  /api/v1/users/me              My profile (auto-provisions on first login)
  GET  /api/v1/users                 List all users, paginated (ADMIN, MANAGER)
  GET  /api/v1/users/{id}            Get user by UUID (ADMIN, MANAGER)
  POST /api/v1/users                 Create user (ADMIN)
  PUT  /api/v1/users/{id}            Update user (ADMIN or own profile)
  DELETE /api/v1/users/{id}          Delete user (ADMIN)

Admin (ADMIN role required)
  GET  /api/v1/admin/dashboard       Stats summary
  GET  /api/v1/admin/audit-log       Recent audit entries

Operations
  GET  /actuator/health              Spring Boot health with component details
  GET  /actuator/prometheus          Prometheus metrics endpoint
  GET  /v3/api-docs                  OpenAPI JSON spec
```

### Example: API Call with cURL

```bash
# Step 1: Obtain a token (development only — use PKCE flow in production)
TOKEN=$(curl -s -X POST \
  http://localhost:8180/realms/oidc-demo/protocol/openid-connect/token \
  -d "client_id=oidc-frontend" \
  -d "username=admin&password=admin123" \
  -d "grant_type=password" | jq -r .access_token)

# Step 2: Use the token
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/v1/users/me | jq .
```

### Standard Error Response

All errors return a consistent JSON structure:

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: insufficient permissions",
  "path": "/api/v1/admin/dashboard",
  "timestamp": "2026-09-28T06:00:00.000Z"
}
```

---

## Frontend

### Pages and Access Control

| Route | Component | Required Role | Description |
|---|---|---|---|
| /login | LoginPage | Public | Keycloak SSO entry point |
| /dashboard | DashboardPage | Any authenticated | Profile + JWT claims view |
| /users | UsersPage | ADMIN or MANAGER | Paginated user management table |
| /admin | AdminPage | ADMIN | Admin stats and audit log |
| /unauthorized | UnauthorizedPage | Public | Shown when role check fails |

### Keycloak Initialization

```typescript
// src/lib/keycloak.ts — singleton instance
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

// src/contexts/AuthContext.tsx — initialization
keycloak.init({
  onLoad: 'check-sso',           // non-blocking: check if session exists
  silentCheckSsoRedirectUri: '${window.location.origin}/silent-check-sso.html',
  pkceMethod: 'S256',            // PKCE with SHA-256
  checkLoginIframe: false,       // avoid iframe overhead in dev
});
```

### Automatic Token Refresh

Axios intercepts every request, refreshes the JWT if it expires within 30 seconds:

```typescript
// src/lib/apiClient.ts
apiClient.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30); // refresh if expiring in < 30s
    config.headers['Authorization'] = `Bearer ${keycloak.token}`;
  }
  return config;
});
```

On 401 response, the interceptor redirects to Keycloak login automatically.

### Role-Based UI

```typescript
const { hasRole, hasAnyRole } = useAuth();

// Navigation links shown conditionally
{hasAnyRole(['ADMIN', 'MANAGER']) && <Link to="/users">Users</Link>}
{hasRole('ADMIN') && <Link to="/admin">Admin</Link>}

// Route protection
<ProtectedRoute requiredRoles={['ADMIN']}>
  <AdminPage />
</ProtectedRoute>
```

### Silent SSO

`public/silent-check-sso.html` is loaded in a hidden iframe by Keycloak.js during
the `check-sso` initialization. If the user already has a Keycloak session from
another application in the same realm, they are automatically authenticated
without any redirect or user interaction.

---

## Monitoring and Observability

### Spring Boot Actuator

Health check: `GET /actuator/health`

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP", "details": { "database": "PostgreSQL" } },
    "diskSpace": { "status": "UP" },
    "ping": { "status": "UP" }
  }
}
```

Exposed endpoints: `health`, `info`, `metrics`, `prometheus`, `loggers`

### Prometheus Metrics

Metrics available at `http://localhost:8080/actuator/prometheus`

Key metrics to monitor:

| Metric | Description |
|---|---|
| `http_server_requests_seconds` | HTTP request latency, count, errors by URI |
| `jvm_memory_used_bytes` | Heap and non-heap memory usage |
| `jvm_gc_pause_seconds` | Garbage collection pause duration |
| `hikaricp_connections_active` | Active database connections |
| `hikaricp_connections_pending` | Threads waiting for a connection |
| `process_cpu_usage` | JVM process CPU utilization |
| `system_cpu_usage` | System-wide CPU utilization |

### Grafana Dashboards

1. Open Grafana: http://localhost:3000 (admin / admin)
2. Go to Configuration > Data Sources
3. Add Prometheus datasource with URL: `http://prometheus:9090`
4. Import Dashboard ID **12900** (JVM Micrometer) from grafana.com

---

## Environment Variables

### Backend (`application.yml`)

All values can be overridden via environment variables:

| Environment Variable | Default Value | Description |
|---|---|---|
| `SERVER_PORT` | `8080` | HTTP server port |
| `DB_URL` | `jdbc:postgresql://localhost:5432/oidcdb` | JDBC connection URL |
| `DB_USERNAME` | `oidcuser` | Database username |
| `DB_PASSWORD` | `oidcpass` | Database password (change in production) |
| `KEYCLOAK_ISSUER_URI` | `http://localhost:8180/realms/oidc-demo` | JWT issuer URI for validation |
| `KEYCLOAK_URL` | `http://localhost:8180` | Keycloak base URL |
| `KEYCLOAK_REALM` | `oidc-demo` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | `oidc-backend` | Backend OAuth2 client ID |
| `KEYCLOAK_CLIENT_SECRET` | `change-me-in-production` | **MUST CHANGE** before deploying |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin for frontend |

### Frontend (`.env`)

| Variable | Default Value | Description |
|---|---|---|
| `VITE_KEYCLOAK_URL` | `http://localhost:8180` | Keycloak server URL |
| `VITE_KEYCLOAK_REALM` | `oidc-demo` | Realm name |
| `VITE_KEYCLOAK_CLIENT_ID` | `oidc-frontend` | Public client ID |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Backend API base URL |

---

## Production Deployment

### Security Checklist

Before going to production, complete this checklist:

- [ ] Replace all default passwords (Keycloak admin, DB, client secret)
- [ ] Set `KEYCLOAK_CLIENT_SECRET` to a cryptographically random value (32+ chars)
- [ ] Enable TLS/HTTPS on all public endpoints
- [ ] Set `KC_HOSTNAME` and `KC_HOSTNAME_STRICT=true` in Keycloak
- [ ] Use a managed database service (AWS RDS, Google Cloud SQL, Azure Database)
- [ ] Remove `localhost` and `http://` from allowed CORS origins
- [ ] Switch from `ddl-auto: validate` + add Flyway migrations
- [ ] Set up log aggregation (ELK Stack, AWS CloudWatch, Grafana Loki)
- [ ] Configure secrets management (HashiCorp Vault, AWS Secrets Manager)
- [ ] Enable Keycloak brute-force protection (already set in realm-export.json)
- [ ] Configure Keycloak email provider for password reset

### Production Docker Compose Override

Create a `docker-compose.prod.yml` override file:

```yaml
services:
  keycloak:
    environment:
      KC_HOSTNAME: auth.yourdomain.com
      KC_HOSTNAME_STRICT: "true"
      KC_HTTP_ENABLED: "true"
      KEYCLOAK_ADMIN_PASSWORD: "${KC_ADMIN_PASSWORD}"
    command: start --import-realm

  backend:
    environment:
      KEYCLOAK_CLIENT_SECRET: "${KEYCLOAK_CLIENT_SECRET}"
      KEYCLOAK_ISSUER_URI: "https://auth.yourdomain.com/realms/oidc-demo"
      FRONTEND_URL: "https://app.yourdomain.com"
      DB_PASSWORD: "${DB_PASSWORD}"
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"

  frontend:
    environment:
      VITE_KEYCLOAK_URL: "https://auth.yourdomain.com"
      VITE_API_BASE_URL: "https://api.yourdomain.com/api/v1"
```

Deploy with:

```bash
# Load secrets from .env.prod file
docker compose --env-file .env.prod \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d --build
```

### Horizontal Scaling Notes

The backend is **stateless** (JWT-based, no session for API calls), so it can be
scaled horizontally behind a load balancer without sticky sessions:

```bash
docker compose up --scale backend=3 -d
```

For the Bucket4j rate limiter to work correctly across multiple instances,
replace the in-memory `ConcurrentHashMap` with a Redis-backed store
using `bucket4j-redis` or Hazelcast.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes following Conventional Commits: `git commit -m 'feat: add my feature'`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request with a description of the changes

---

## License

This project is licensed under the **Apache License 2.0**.
See the [LICENSE](LICENSE) file for details.

---

Built with Spring Boot 3 + Keycloak 25 + React 18 + Docker Compose
