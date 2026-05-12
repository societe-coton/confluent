# Multi-stage production image for @confluent/web.
# Context expected: repository root (monorepo).
#
# Build:   docker build -f apps/web/Dockerfile --target prod \
#            --build-arg DOPPLER_TOKEN=<token> --build-arg APP_VERSION=<x.y.z> \
#            -t confluent-web:<tag> .
# Layers:  deps  → install monorepo deps (cached)
#          build → compile shared + build vite bundle (doppler injects VITE_* at build)
#          prod  → nginx:alpine serving the static bundle

FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
ARG DOPPLER_TOKEN
ARG APP_VERSION
ENV DOPPLER_TOKEN=${DOPPLER_TOKEN}
ENV APP_VERSION=${APP_VERSION}
WORKDIR /repo
COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/
RUN pnpm --filter @confluent/shared build
RUN apk add --no-cache curl gnupg \
 && curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh \
 && doppler run -- pnpm --filter @confluent/web build

FROM nginx:alpine AS prod
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
