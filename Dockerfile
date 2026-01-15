# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install Prisma CLI and tsx for running TypeScript config
RUN npm install -g prisma tsx

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Copy prisma.config.ts (required for Prisma 7 migrations)
COPY --from=builder /app/prisma.config.ts ./

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Expose the port
EXPOSE 3001

# Start the application using entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]


