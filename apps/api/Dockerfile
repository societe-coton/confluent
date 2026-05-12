# Multi-stage production image for @confluent/api.
# Context expected: repository root (monorepo).
#
# Build:   docker build -f apps/api/Dockerfile -t confluent-api:<tag> .
# Layers:  deps  → install monorepo deps (cached)
#          build → compile shared + generate prisma client + nest build
#          runtime → minimal final image (alpine + dist + prisma client)

FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
# `pnpm install` would run the api postinstall (`prisma generate`) and fail here
# because the schema file isn't copied yet. Skip it: the build stage runs it explicitly.
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
WORKDIR /repo
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
RUN pnpm --filter @confluent/shared build
RUN pnpm --filter @confluent/api exec prisma generate --schema=./prisma/schema.prisma
RUN pnpm --filter @confluent/api build

FROM node:24-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /repo
ENV NODE_ENV=production
# Monorepo metadata (needed for `pnpm --filter` + workspace resolution at runtime).
COPY --from=build /repo/package.json /repo/pnpm-workspace.yaml /repo/pnpm-lock.yaml ./
COPY --from=build /repo/node_modules/ node_modules/
# Shared package — compiled output only.
COPY --from=build /repo/packages/shared/dist/ packages/shared/dist/
COPY --from=build /repo/packages/shared/package.json packages/shared/
# API — dist, prisma assets, and package.json (carries scripts + prisma.seed block).
COPY --from=build /repo/apps/api/dist/ apps/api/dist/
COPY --from=build /repo/apps/api/prisma/ apps/api/prisma/
COPY --from=build /repo/apps/api/package.json apps/api/
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
