FROM node:lts-alpine3.12
RUN mkdir /data
COPY ./ /data
WORKDIR /data
RUN yarn install --production
RUN adduser --disabled-password --gecos "" slowdowner
RUN chown slowdowner:slowdowner /data
USER slowdowner
CMD yarn run start
EXPOSE 8080
