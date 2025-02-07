import { type } from 'arktype';

// const PrismaLogLevel = type.enumerated('info', 'query', 'warn', 'error');

// const PrismaLogLevels = PrismaLogLevel.array().optional();

const envSchema = type({
  NODE_ENV: '("development" | "production" | "test") = "production"',
  DEV_TOOLS: type('string | undefined').pipe((v) => v === 'true'),
  BETTER_AUTH_URL: 'string.url',
  // PRISMA_LOG_LEVEL: PrismaLogLevels,
});

const parsed = envSchema({
  NODE_ENV: import.meta.env.NODE_ENV ?? import.meta.env.MODE,
  DEV_TOOLS: import.meta.env.VITE_DEV_TOOLS,
  BETTER_AUTH_URL: import.meta.env.VITE_BETTER_AUTH_URL,
  // PRISMA_LOG_LEVEL: import.meta.env.VITE_PRISMA_LOG_LEVEL,
});

console.log({ parsed });

if (parsed instanceof type.errors) {
  throw new Error(parsed.summary);
}

export const env = parsed;
