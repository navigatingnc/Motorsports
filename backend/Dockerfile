# =============================================================================
# Stage 1 — deps: install ALL dependencies (including devDependencies)
# =============================================================================
FROM node:22-alpine AS deps

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (dev + prod) needed for the build step
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 2 — builder: compile TypeScript and generate Prisma Client
# =============================================================================
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source tree
COPY . .

# Generate Prisma Client (output path defined in schema.prisma)
RUN pnpm prisma:generate

# Compile TypeScript → dist/
RUN pnpm build

# =============================================================================
# Stage 3 — production: lean runtime image
# =============================================================================
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package manifests
COPY package.json pnpm-lock.yaml ./

# Install production-only dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations (needed for prisma migrate deploy at startup)
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma Client
COPY --from=builder /app/src/generated ./src/generated

# Switch to non-root user
USER appuser

# Expose the API port (default 3000, overridable via PORT env var)
EXPOSE 3000

# Health check — calls the /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Run pending migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
