# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

# Prod bağımlılıkları (yoksa hata vermesin diye || true)
RUN npm install --omit=dev || true

EXPOSE 8080
CMD ["node", "services/api-gateway/index.js"]
