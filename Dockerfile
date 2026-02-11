# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY --from=builder /usr/src/app/dist ./dist
# Copy source, tests and configs for testing/validation
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/tests ./tests
COPY --from=builder /usr/src/app/jest.config.js ./jest.config.js
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json
# Copy migrations file so it can be accessed at runtime
COPY --from=builder /usr/src/app/src/config/migrations.sql ./dist/config/migrations.sql

EXPOSE 3000
CMD ["node", "dist/server.js"]
