# =============================================================================
# VolunteerHub — Multi-stage Docker build
# Produces the Express API server image with Prisma client
# =============================================================================

# --------------- Stage 1: Install dependencies ---------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY shared/package.json shared/

RUN npm ci --ignore-scripts
RUN npx prisma generate --schema=prisma/schema.prisma 2>/dev/null || true

# --------------- Stage 2: Build shared library ---------------
FROM deps AS shared-build

COPY shared/ shared/
COPY tsconfig.base.json ./

# --------------- Stage 3: Build server ---------------
FROM shared-build AS server-build

COPY server/ server/
COPY prisma/ prisma/

RUN npx prisma generate --schema prisma/schema.prisma
RUN npx tsc -p server/tsconfig.json --noEmit false --rootDir server/src

# --------------- Stage 4: Build client ---------------
FROM shared-build AS client-build

COPY client/ client/

RUN npm run build -w client

# --------------- Stage 5: Production server image ---------------
FROM node:20-alpine AS server

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/
COPY shared/package.json shared/
COPY client/package.json client/

RUN npm ci --omit=dev --ignore-scripts

COPY prisma/ prisma/
RUN npx prisma generate --schema prisma/schema.prisma

COPY --from=server-build /app/server/dist/ server/dist/
COPY --from=server-build /app/shared/ shared/
COPY docker/docker-entrypoint.sh /app/docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

ENTRYPOINT ["/app/docker-entrypoint.sh"]

# --------------- Stage 6: Production client image (nginx) ---------------
FROM nginx:alpine AS client

RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=client-build /app/client/dist/ /usr/share/nginx/html/

EXPOSE 80
