# Dockerfile
# Build stage: compile TypeScript
ARG SKIP_BUILD=false
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY . .
RUN if [ "$SKIP_BUILD" = "false" ]; then npm run build; fi

# Runtime stage: Debian-based for apt support
FROM node:20-slim AS runtime
WORKDIR /app

ENV COLORTERM=24bit
ENV TERM=xterm-256color

# Install system dependencies and ascii-image-converter
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       gnupg2 \
       apt-transport-https \
       ca-certificates \
       curl \
       dumb-init \
  && echo 'deb [trusted=yes] https://apt.fury.io/ascii-image-converter/ /' \
       > /etc/apt/sources.list.d/ascii-image-converter.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends ascii-image-converter \
  && rm -rf /var/lib/apt/lists/*

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
# Entrypoint with dumb-init for signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
