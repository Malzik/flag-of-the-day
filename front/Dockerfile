FROM node:16.13-alpine as build-stage

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

# Stage 2
FROM nginx:1.17.0-alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build-stage /app/build .
COPY --from=build-stage /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
