# ============================================
# Mini ERP + CRM — Multi-Stage Dockerfile
# ============================================
# Produces a lean production image that serves
# the built React frontend as static files
# from the Express backend.

# ── Stage 1: Install all dependencies ────────
FROM node:20-alpine AS deps

WORKDIR /app

# Backend dependencies
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci

# Frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

# ── Stage 2: Build the React frontend ────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ .

RUN npm run build

# ── Stage 3: Build the Express backend ───────
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend/ .

# Generate Prisma client + compile TypeScript
RUN npx prisma generate && npx tsc

# ── Stage 4: Production image ────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + migrations (for prisma migrate deploy)
COPY backend/prisma ./prisma

# Generate Prisma client in the production node_modules
RUN npx prisma generate

# Copy compiled backend
COPY --from=backend-build /app/backend/dist ./dist

# Copy built frontend into the location the backend expects
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# The backend serves frontend/dist in production mode (see app.ts)
ENV NODE_ENV=production
EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
