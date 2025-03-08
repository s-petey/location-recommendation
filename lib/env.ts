import { type } from 'arktype';

// const PrismaLogLevel = type.enumerated('info', 'query', 'warn', 'error');

// const PrismaLogLevels = PrismaLogLevel.array().optional();

const envSchema = type({
  NODE_ENV: '("development" | "production" | "test") = "production"',
  DEV_TOOLS: type('string | undefined').pipe((v) => v === 'true'),
  BETTER_AUTH_URL: 'string.url',
  VITE_ALLOWED_EMAILS: 'string',
  // PRISMA_LOG_LEVEL: PrismaLogLevels,
  VITE_TURSO_DATABASE_URL: 'string > 1',
  VITE_TURSO_AUTH_TOKEN: 'string > 1',
});

const parsed = envSchema({
  NODE_ENV: import.meta.env.NODE_ENV ?? import.meta.env.MODE,
  DEV_TOOLS: import.meta.env.VITE_DEV_TOOLS,
  BETTER_AUTH_URL: import.meta.env.VITE_BETTER_AUTH_URL,
  VITE_ALLOWED_EMAILS: import.meta.env.VITE_ALLOWED_EMAILS,
  // PRISMA_LOG_LEVEL: import.meta.env.VITE_PRISMA_LOG_LEVEL,
  // TODO: Make the following optional...
  VITE_TURSO_DATABASE_URL: import.meta.env.VITE_TURSO_DATABASE_URL,
  VITE_TURSO_AUTH_TOKEN: import.meta.env.VITE_TURSO_AUTH_TOKEN,
});

if (parsed instanceof type.errors) {
  throw new Error(parsed.summary);
}

export const env = parsed;
