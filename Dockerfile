FROM node:20-alpine

# Increase Node memory for admin build
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN npm install

# Copy source and config
COPY . .

# Build Medusa (including admin)
RUN npm run build

# Expose port
EXPOSE 9000

# Start command
CMD ["sh", "-c", "npx medusa db:migrate && npm start"]
