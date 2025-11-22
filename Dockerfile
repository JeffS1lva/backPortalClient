# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV=production

ARG PNPM_VERSION=9.5.0
RUN npm install -g pnpm@$PNPM_VERSION

FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential python-is-python3 pkg-config node-gyp

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

FROM base AS final
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
CMD ["node", "server.js"]
