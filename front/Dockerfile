FROM node:22.2.0-alpine as build-stage

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

# Stage 2
FROM nginx:1.25.5-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build-stage /app/build .
COPY --from=build-stage /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
