# incident-frontend/Dockerfile
# --- Stage 1: Build the React Application ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

# Copy source code and build the production assets
COPY . .
RUN npm run build

# --- Stage 2: Serve the Static Files using Nginx ---
FROM nginx:stable-alpine AS production-stage
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config (MUST BE CREATED IN STEP 2.2)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]