FROM node:19.5.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g @sentry/cli

COPY . .

ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV GENERATE_SOURCEMAP=true

RUN npm run build

RUN sentry-cli releases files 0.1.12 -p javascript-react --org university-y1 upload-sourcemaps /app/build  --validate

#RUN sentry-cli releases files -p javascript-react --org university-y1 $(sentry-cli releases propose-version) upload-sourcemaps /app/build --url-prefix '~/static/js' --validate


#RUN sentry-cli releases files "0.1.0" upload-sourcemaps /app/build --url-prefix '~/static/js' --validate


FROM node:19.5.0-alpine


WORKDIR /app

COPY --from=builder /app/build ./build

COPY --from=builder /app/package.json ./package.json

RUN npm install -g serve

EXPOSE 3000


CMD ["serve", "-s", "build"]
