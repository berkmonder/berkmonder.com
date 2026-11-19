# berkmonder.com as an image: built with Node 24 and the pnpm version in package.json, then served
# by Caddy as static files. CI builds it on every push to main (.github/workflows/deploy.yml).
FROM docker.io/library/node:24.21.0-bookworm-slim AS build
WORKDIR /src
RUN corepack enable
COPY . .
RUN CI=true pnpm install --frozen-lockfile && pnpm run build

# The CV: cv/cv.md laid out as a PDF (cv/build.py), served with the Markdown next to it as
# /files/resume_muhammedBerkOnder.pdf and /files/cv.md (which turquoise reads).
FROM docker.io/library/python:3.12-slim AS cv-build
RUN apt-get update && apt-get install -y --no-install-recommends libpango-1.0-0 libpangoft2-1.0-0 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:0.8.22 /uv /bin/uv
COPY cv /cv
RUN uv run --script /cv/build.py /out/resume_muhammedBerkOnder.pdf && cp /cv/cv.md /out/cv.md

# Only the CV's files (podman build --target cv -o cv/out . puts them in cv/out to preview).
FROM scratch AS cv
COPY --from=cv-build /out/ /

FROM docker.io/library/caddy:2.11.6-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /src/dist /srv
COPY --from=cv / /srv/files/
