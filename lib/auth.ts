import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from './env.js';

const adapter = new PrismaLibSQL({
  url: env.VITE_TURSO_DATABASE_URL,
  authToken: env.VITE_TURSO_AUTH_TOKEN,
});
// @ts-expect-error Adapter type isn't matching?
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite', // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
});
