FROM node:24-alpine
RUN apk add --no-cache tzdata
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
CMD ["node", "index.js"]