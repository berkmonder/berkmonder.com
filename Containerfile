# berkmonder.com as an image: built with Node 24 and the pnpm version in package.json, then served
# by Caddy as static files. CI builds it on every push to main (.github/workflows/deploy.yml).
FROM docker.io/library/node:24.21.0-bookworm-slim AS build
WORKDIR /src
RUN corepack enable
COPY . .
RUN CI=true pnpm install --frozen-lockfile && pnpm run build

FROM docker.io/library/caddy:2.11.6-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /src/dist /srv
