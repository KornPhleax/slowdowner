FROM node:lts-alpine3.12
RUN mkdir /data
COPY ./ /data
WORKDIR /data
RUN ls -lash
RUN yarn install --production
RUN adduser --disabled-password --gecos "" slowdowner
RUN chown slowdowner:slowdowner /data
CMD yarn run start
EXPOSE 8080
