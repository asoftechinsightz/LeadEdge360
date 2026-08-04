# Multi-stage Dockerfile for AsoftechInsightz SaaS
# Builds a slim production image leveraging Next.js standalone output.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
# Build-time placeholders for Next.js page-data collection (not used at runtime).
ARG MONGO_URL=mongodb://mongo:27017
ARG DB_NAME=asoftech_saas
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG JWT_SECRET=docker-build-placeholder-min-16-chars
ENV MONGO_URL=$MONGO_URL \
    DB_NAME=$DB_NAME \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    JWT_SECRET=$JWT_SECRET
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN mkdir -p public
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/config ./config
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
