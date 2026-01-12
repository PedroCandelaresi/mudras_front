# syntax=docker/dockerfile:1.6

FROM node:20-bookworm-slim AS deps
WORKDIR /app
ENV CI=true NPM_CONFIG_LEGACY_PEER_DEPS=true NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false
RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential ca-certificates git \
 && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN --mount=type=secret,id=front_env cp /run/secrets/front_env ./.env
RUN npm run build

# ---------- runner ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 CI=true

# ✅ En runtime no necesitás curl para HTTPS; Node usa CA certs del sistema.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# ✅ opcional: --ignore-scripts para reducir supply-chain en runtime
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copiar artefactos como usuario node (en node image ya existe user node uid 1000)
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public

# ❌ NO copies .env al runtime dentro de la imagen
# La config va por env_file en docker-compose

USER node

EXPOSE 3000
CMD ["node","./node_modules/next/dist/bin/next","start","-p","3000","-H","0.0.0.0"]
