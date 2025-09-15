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
# ⬇️ copia el secret a .env ANTES del build
RUN --mount=type=secret,id=front_env cp /run/secrets/front_env ./.env
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 CI=true NPM_CONFIG_LEGACY_PEER_DEPS=true NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
# opcional: dejar el .env en runtime
COPY --from=build /app/.env ./.env
EXPOSE 3000
CMD ["npm","run","start","--","-p","3000","-H","0.0.0.0"]
