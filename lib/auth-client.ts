import { createAuthClient } from 'better-auth/react';

// TODO: ENV file...
export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000', // the base url of your auth server
});
