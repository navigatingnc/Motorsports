# =============================================================================
# Stage 1 — deps: install ALL dependencies
# =============================================================================
FROM node:22-alpine AS deps

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 2 — builder: run Vite production build
# =============================================================================
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# VITE_API_BASE_URL must be supplied at build time via --build-arg / ARG so
# the frontend bundle points to the correct backend URL in production.
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the production bundle into dist/
RUN pnpm build

# =============================================================================
# Stage 3 — production: serve with nginx
# =============================================================================
FROM nginx:1.27-alpine AS production

# Remove the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check — nginx serves a 200 on the root path
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
