# Build stage — full deps, produces the standalone server bundle.
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# auth.ts refuses to load without JWT_SECRET in production — satisfy it for the
# build's page-data collection only. Not baked in: the runtime stage doesn't set
# it, so the real guard still fires if the deployment forgets the secret.
RUN JWT_SECRET=build-time-only npm run build

# Runtime stage — only the traced standalone output, no dev deps.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Admin/maintenance scripts (create-admin etc.) — standalone tracing already
# bundles their deps (pg), so they can run via `docker compose exec app node scripts/...`
COPY --from=builder /app/scripts ./scripts
# Uploads land here at runtime (STORAGE_PROVIDER=local); compose bind-mounts it.
RUN mkdir -p public/uploads && chown -R node:node public/uploads
USER node
EXPOSE 3000
CMD ["node", "server.js"]
