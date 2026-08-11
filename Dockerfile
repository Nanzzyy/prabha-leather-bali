# Coolify-ready standalone deployment for Praba Leather Bali.
# Multi-stage: build the Next.js server, then copy only its runtime output.
#
# Set these in Coolify Build Args:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   DATA_SOURCE_DRIVER   (default: supabase)

FROM node:22-alpine AS builder

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG DATA_SOURCE_DRIVER=supabase

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV DATA_SOURCE_DRIVER=${DATA_SOURCE_DRIVER}
ENV OUTPUT_MODE=standalone

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS final

WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
