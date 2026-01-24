FROM node:24.13.0-alpine AS builder
WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm ci --silent

# Copy sources and build
COPY . .
RUN npm run build

FROM node:24.13.0-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npm", "run", "start"]
