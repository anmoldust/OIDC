# ─────────────────────────────────────────────────────────────────────────────
#  OIDC App - Root Dockerfile for Render Deployment
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build React Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --silent

# Copy source code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*

# Copy build output to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
