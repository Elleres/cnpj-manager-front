# Estágio 1: Build (Node 24)
FROM node:24-alpine AS build-stage

RUN apk add --no-cache python3 make g++

WORKDIR /app

# 1. Copiamos TUDO (menos o que está no .dockerignore)
COPY . .

# 2. Instalamos as dependências
RUN npm install

# 3. Build do projeto
RUN npm run build

# Estágio 2: Produção (Nginx)
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]