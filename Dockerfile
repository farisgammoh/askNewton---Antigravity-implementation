# Dockerfile for AskNewton Enhanced Webhook Server
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directories for assets and databases
RUN mkdir -p public lib attached_assets && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "
    fetch('http://localhost:3000/healthz')
      .then(r => r.json())
      .then(d => d.ok ? process.exit(0) : process.exit(1))
      .catch(() => process.exit(1))
  " || exit 1

# Start command
CMD ["node", "server.js"]