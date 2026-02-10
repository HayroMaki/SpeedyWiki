FROM node:20-slim AS base

WORKDIR /app

# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY requirements.txt ./
# Install python packages
RUN pip3 install -r requirements.txt --break-system-packages

COPY . .

EXPOSE 3001 3002

CMD ["node", "server.js"]
