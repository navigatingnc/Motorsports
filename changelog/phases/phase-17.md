# Phase 17: DevOps: Docker Deployment Configuration

**Date:** March 1, 2026  
**Status:** ✅ Completed

---

### Summary

Implemented a complete, production-ready Docker deployment configuration for the full Motorsports Management stack. The setup uses multi-stage builds to produce lean, secure images for both the backend API and the React frontend, orchestrated by a root-level `docker-compose.yml`. A development override file (`docker-compose.dev.yml`) is also provided for hot-reload local development. All services include health checks, environment variable management, and security best practices.

### Work Performed

1. **Backend Multi-Stage Dockerfile** (`backend/Dockerfile`)
   - **Stage 1 — `deps`**: Installs all dependencies (including devDependencies) using pnpm with a frozen lockfile for reproducible builds.
   - **Stage 2 — `builder`**: Generates the Prisma Client (`prisma generate`) and compiles TypeScript to `dist/` via `tsc`.
   - **Stage 3 — `production`**: Copies only the compiled output, Prisma schema/migrations, generated client, and production `node_modules` into a minimal `node:22-alpine` image. Runs as a non-root user (`appuser`). Executes `prisma migrate deploy` then `node dist/index.js` on startup.
   - Added `HEALTHCHECK` calling the `/health` endpoint.

2. **Frontend Multi-Stage Dockerfile** (`frontend/Dockerfile`)
   - **Stage 1 — `deps`**: Installs all dependencies with pnpm.
   - **Stage 2 — `builder`**: Accepts `VITE_API_BASE_URL` as a build argument (baked into the bundle at build time) and runs `pnpm build` to produce the Vite production bundle.
   - **Stage 3 — `production`**: Copies the `dist/` output into an `nginx:1.27-alpine` image. Uses a custom `nginx.conf` for SPA routing, gzip compression, and long-lived asset caching.
   - Added `HEALTHCHECK` verifying nginx responds on port 80.

3. **nginx Configuration** (`frontend/nginx.conf`)
   - Serves static assets with `Cache-Control: public, immutable` and 1-year expiry.
   - Falls back all unknown routes to `index.html` for React Router client-side navigation.
   - Enables gzip for JS, CSS, JSON, and SVG.
   - Adds security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.

4. **Root `docker-compose.yml`** (production)
   - Orchestrates three services: `postgres` (PostgreSQL 16-alpine), `backend`, and `frontend`.
   - All services communicate over a private `internal` bridge network; only the frontend exposes a host port (default `80`).
   - PostgreSQL port is **not** exposed to the host in production.
   - Uses `depends_on` with `condition: service_healthy` to enforce correct startup order.
   - All secrets and configuration are injected via environment variables from a root `.env` file; required variables (`POSTGRES_PASSWORD`, `JWT_SECRET`) use the `:?` syntax to fail fast if unset.
   - Named volume `postgres_data` persists database state across container restarts.

5. **Development Override** (`docker-compose.dev.yml`)
   - Exposes PostgreSQL on host port `5432` for local DB tools.
   - Mounts `backend/src` and `frontend/src` as read-only volumes for hot-reload.
   - Overrides backend command to run `pnpm dev` (ts-node/nodemon) and frontend to run `pnpm dev --host` (Vite dev server on port `5173`).

6. **Environment Variable Template** (`.env.example`)
   - Documents all required and optional environment variables with inline comments.
   - Covers PostgreSQL credentials, JWT config, CORS origin, Vite API URL, frontend port, and all S3 storage settings.

7. **`.dockerignore` Files**
   - Root `.dockerignore`: excludes `.env`, `node_modules`, `dist`, generated Prisma client, and OS noise from the Docker build context.
   - `backend/.dockerignore` and `frontend/.dockerignore`: service-level ignores mirroring the above.

8. **README.md Update**
   - Added a **Docker Deployment (Production)** section with a 4-step quick-start guide.
   - Added a **Development with Docker** subsection explaining the override file.
   - Updated the **Project Structure** tree to include all new Docker-related files.

### Code Generated

#### `backend/Dockerfile`
```dockerfile
# Stage 1 — deps
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2 — builder
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

# Stage 3 — production
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

#### `frontend/Dockerfile`
```dockerfile
# Stage 1 — deps
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2 — builder
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

# Stage 3 — production
FROM nginx:1.27-alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

#### `frontend/nginx.conf`
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;
    gzip_min_length 256;
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

#### `docker-compose.yml`
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    container_name: motorsports_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-motorsports}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
      POSTGRES_DB: ${POSTGRES_DB:-motorsports_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-motorsports} -d ${POSTGRES_DB:-motorsports_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: motorsports_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://${POSTGRES_USER:-motorsports}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-motorsports_db}?schema=public
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost}
      JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
      args:
        VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:3000}
    container_name: motorsports_frontend
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "${FRONTEND_PORT:-80}:80"
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:80/ || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
volumes:
  postgres_data:
    driver: local
networks:
  internal:
    driver: bridge
```

#### `docker-compose.dev.yml`
```yaml
version: '3.9'
services:
  postgres:
    ports:
      - "5432:5432"
  backend:
    build:
      target: builder
    environment:
      NODE_ENV: development
      CORS_ORIGIN: http://localhost:5173
    volumes:
      - ./backend/src:/app/src:ro
    command: ["sh", "-c", "npx prisma migrate deploy && pnpm dev"]
    ports:
      - "3000:3000"
  frontend:
    build:
      target: builder
      args:
        VITE_API_BASE_URL: http://localhost:3000
    volumes:
      - ./frontend/src:/app/src:ro
    command: ["pnpm", "dev", "--host"]
    ports:
      - "5173:5173"
```

#### `.env.example`
```env
POSTGRES_USER=motorsports
POSTGRES_PASSWORD=change_me_in_production
POSTGRES_DB=motorsports_db
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost
VITE_API_BASE_URL=http://localhost:3000
FRONTEND_PORT=80
S3_ENDPOINT=
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=motorsports-uploads
S3_PUBLIC_BASE_URL=
PRESIGNED_URL_EXPIRES_IN=3600
```

---
