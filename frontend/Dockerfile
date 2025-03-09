# Etapa 1: Construir la aplicación React con Create React App
FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Copia los archivos generados en la etapa de build
COPY --from=build /app/build /usr/share/nginx/html

# Copia la configuración de Nginx (ajusta según tu nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]