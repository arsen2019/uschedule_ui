FROM node:19.5.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @sentry/cli

COPY . .

ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV GENERATE_SOURCEMAP=true

ARG BUILD_ENV=build
RUN npm run $BUILD_ENV
ARG SENTRY_AUTH_TOKEN
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_ANALYTICS_ID
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_GOOGLE_ANALYTICS_ID=${REACT_APP_GOOGLE_ANALYTICS_ID}


RUN sentry-cli login --auth-token $SENTRY_AUTH_TOKEN \
  && sentry-cli releases files 0.1.12 -p javascript-react --org university-y1 upload-sourcemaps /app/build --validate


FROM node:19.5.0-alpine


WORKDIR /app

COPY --from=builder /app/build ./build

COPY --from=builder /app/package.json ./package.json

RUN npm install -g serve

EXPOSE 3000


CMD ["serve", "-s", "build"]
