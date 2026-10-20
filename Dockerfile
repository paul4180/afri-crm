FROM node:22-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --production

# Copy app source
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose the port Railway expects
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Start the server
CMD ["node", "src/server.js"]
