FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/database/package.json ./packages/database/
COPY apps/web/package.json ./apps/web/

RUN bun install

COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN cd apps/web && bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app/apps/web/dist ./dist
EXPOSE 8080
CMD bunx serve -s dist -l $PORT
