# Storybook static build for ui.vllnt.com monorepo.
# Build from repo root so pnpm workspace links resolve.
# Final image: nginx-unprivileged serving the static export.

FROM node:24.22.1-alpine@sha256:6a1c190e17215d844926b0677f4bf87273ff7d5e54db06d3b5b5863ab0b09a3d AS build
WORKDIR /src

# Install pnpm matching the project version
RUN corepack enable && corepack prepare pnpm@11.28.8 --activate

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
