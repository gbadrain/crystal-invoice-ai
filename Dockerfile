FROM node:22-slim

# Chromium dependencies for Puppeteer (PDF generation)
RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 \
    libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0 \
    libxshmfence1 libglu1 chromium \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Use server-only package.json — no Next.js, no Prisma
COPY server/package.json ./package.json
RUN npm install

# Copy server source and shared utilities it imports
COPY server/ ./server/
COPY src/utils/ ./src/utils/

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
