# Storybook static build for ui.vllnt.ai monorepo.
# Build from repo root so pnpm workspace links resolve.
# Final image: nginx-unprivileged serving the static export.

FROM node:24-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS build
WORKDIR /src

# Install pnpm matching the project version
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy lockfile + manifest first for layer caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy all packages so workspace resolution works
COPY packages ./packages
COPY apps ./apps

# Install only what's needed for storybook build (workspace-aware)
RUN pnpm install --frozen-lockfile --filter @vllnt/ui --filter @vllnt/ui... --include-workspace-root

# Build storybook → packages/ui/storybook-static
RUN pnpm --filter @vllnt/ui build-storybook

# ---

FROM nginxinc/nginx-unprivileged:alpine@sha256:4c18337659c90a01627f2e152b7c89524521c82dcedb255dc83d3689642b0803 AS runtime

# nginx-unprivileged image ships with uid 101 + nginx group; configured to
# listen on 8080 by default and write to /tmp. K8s spec uses runAsUser 101.
COPY --chown=101:101 apps/storybook/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /src/packages/ui/storybook-static /usr/share/nginx/html

EXPOSE 8080
