# syntax=docker/dockerfile:1.6

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
    
    # Copiamos el código (incluí .dockerignore correcto)
    COPY . .
    
    # Montamos el secret y lo copiamos a /app/.env para el build de Next
    RUN --mount=type=secret,id=front_env,dst=/tmp/.env \
        cp /tmp/.env ./.env
    
    # Si querés ver qué variables cargó Next, podés (opcional):
    # RUN cat .env
    
    # Build de Next (leerá .env automáticamente)
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
    
    # App compilada
    COPY --from=build /app/.next ./.next
    COPY --from=build /app/public ./public
    
    # (Opcional) Copiar también el .env al runtime por si lo querés conservar visible:
    COPY --from=build /app/.env ./.env
    
    EXPOSE 3000
    CMD ["npm","run","start","--","-p","3000","-H","0.0.0.0"]
    