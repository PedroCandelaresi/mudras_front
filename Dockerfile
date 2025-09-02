# ---------- deps ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
ENV CI=true \
    NPM_CONFIG_LEGACY_PEER_DEPS=true \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential ca-certificates git \
 && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci

# ---------- build ----------
FROM deps AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=true \
    NPM_CONFIG_LEGACY_PEER_DEPS=true \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm","run","start","--","-p","3000","-H","0.0.0.0"]
