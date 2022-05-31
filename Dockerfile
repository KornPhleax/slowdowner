FROM node:lts-alpine3.15 AS builder
RUN apk add gifsicle libpng libpng-dev libtool file nasm autoconf automake pkgconfig make g++ python2
RUN mkdir /data
WORKDIR /data
COPY ./ ./
RUN yarn install && yarn run build

FROM node:lts-alpine3.15
RUN mkdir /data
WORKDIR /data
COPY --from=builder /data/package.json .
COPY --from=builder /data/src/main.js ./src/
COPY --from=builder /data/dist ./dist
RUN yarn install --production
RUN adduser --disabled-password --gecos "" slowdowner
RUN chown slowdowner:slowdowner /data
USER slowdowner
CMD yarn run start
EXPOSE 8080