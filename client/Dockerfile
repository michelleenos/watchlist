FROM node:lts-alpine AS build 

WORKDIR /app

ENV CI=true

RUN corepack enable 

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN corepack install 

RUN pnpm install

COPY . ./

RUN pnpm build

# Use the Caddy image
FROM caddy
# Create and change to the app directory.
WORKDIR /app
# Copy Caddyfile to the container image.
COPY Caddyfile ./
# Copy local code to the container image.
RUN caddy fmt Caddyfile --overwrite

COPY --from=build /app/dist ./dist

CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
