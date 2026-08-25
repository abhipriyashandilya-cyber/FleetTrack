# Stage 1: Build React/Vite production assets
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve compiled build with lightweight NGINX server
FROM nginx:alpine

# Copy build output to NGINX HTML web folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom NGINX configuration for Single Page Application (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]