FROM node:10-alpine AS app-build
RUN apk add --no-cache git
RUN mkdir -p /app-src
WORKDIR /app-src
RUN git clone --depth=1 https://github.com/kyleratti/tuckbot-api.git .
RUN npm install
RUN npm run build

FROM node:10-alpine AS app-runtime
RUN mkdir /data
RUN mkdir /app
COPY --from=app-build /app-src/node_modules/ /app/node_modules/
COPY --from=app-build /app-src/lib/ /app/lib/

EXPOSE 3002
VOLUME /data

WORKDIR /app
CMD [ "node", "-r", "dotenv/config", "lib/index.js" ]
