# Multi-stage Dockerfile for AsoftechInsightz SaaS
# Builds a slim production image leveraging Next.js standalone output.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
# Allow lockfile refresh when package.json is synced ahead of yarn.lock (VPS manual deploy).
RUN yarn install --frozen-lockfile || yarn install

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static

COPY --from=deps --chown=app:app /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
