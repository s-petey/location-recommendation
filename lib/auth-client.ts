import { createAuthClient } from 'better-auth/react';
import { env } from './env.js';

export const authClient = createAuthClient({
  // the base url of your auth server
  baseURL: env.BETTER_AUTH_URL,
});
