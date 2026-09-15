FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Run as non-root node user for security
USER node

# Start the bot
CMD ["node", "bot.js"]
