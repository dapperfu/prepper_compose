FROM node:22-alpine AS assets
WORKDIR /build
RUN apk add --no-cache curl unzip ca-certificates
COPY portal/package.json portal/build-style.mjs portal/vendor-assets.mjs ./
RUN npm install --omit=dev
RUN node build-style.mjs && node vendor-assets.mjs

FROM nginx:1.27-alpine
COPY portal/nginx.conf /etc/nginx/conf.d/default.conf
COPY portal/html /usr/share/nginx/html
COPY --from=assets /build/out/style.json /usr/share/nginx/html/style.json
COPY --from=assets /build/out/vendor/ /usr/share/nginx/html/vendor/
COPY --from=assets /build/out/map-assets/ /usr/share/nginx/html/map-assets/
RUN mkdir -p /data/files
