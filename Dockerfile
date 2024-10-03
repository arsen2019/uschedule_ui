FROM node:19.5.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_OPTIONS="--max_old_space_size=4096"


RUN npm run build


FROM node:19.5.0-alpine


WORKDIR /app

COPY --from=builder /app/build ./build

RUN npm install -g serve

EXPOSE 3000


CMD ["serve", "-s", "build"]
