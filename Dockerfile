# ---- Build Stage ----
FROM oven/bun:1.2.23-alpine AS builder

WORKDIR /app

COPY package.json bun.lock prisma ./
RUN bun install --frozen-lockfile
# RUN bun run prisma:generate

COPY . .
RUN bun run build

# ---- Production Stage ----
FROM oven/bun:1.2.23-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules

# If you have a .env.production or .env file, copy it here
# COPY .env.production .env

EXPOSE 3000

CMD ["bun", "start"]
