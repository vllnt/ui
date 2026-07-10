# ui.vllnt.com — component registry/docs site (standalone output).
# Built from vllnt/ui monorepo, app: apps/registry. Workspace dep: @vllnt/ui.

FROM node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920 AS builder
WORKDIR /src

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY DESIGN.md ./
COPY packages ./packages
COPY apps ./apps

RUN pnpm install --frozen-lockfile --filter "@vllnt/ui-registry..." --include-workspace-root

ARG NEXT_PUBLIC_STORYBOOK_URL=https://storybook.vllnt.ai
ENV NEXT_PUBLIC_STORYBOOK_URL=$NEXT_PUBLIC_STORYBOOK_URL

RUN pnpm --filter @vllnt/ui-registry build

# ---

FROM node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920 AS runtime
WORKDIR /app

RUN addgroup -S -g 65532 app && adduser -S -u 65532 -G app app

# Standalone monorepo layout: standalone dir contains workspace tree.
# server.js lives at .next/standalone/apps/registry/server.js
COPY --from=builder --chown=65532:65532 /src/apps/registry/.next/standalone ./
COPY --from=builder --chown=65532:65532 /src/apps/registry/.next/static ./apps/registry/.next/static
COPY --from=builder --chown=65532:65532 /src/apps/registry/public ./apps/registry/public

USER 65532:65532
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

CMD ["node", "apps/registry/server.js"]
