import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { getWebRequest } from '@tanstack/start/server';
import { auth } from '~/lib/auth';

const fetchBetterAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const req = getWebRequest();

  if (!req) {
    return null;
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return session;
});

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const authSession = await fetchBetterAuth();

    if (!authSession?.session?.token && location.pathname !== '/login') {
      throw redirect({
        to: '/login',
        replace: true,
        throw: true,
        // TODO: Get proper from...
        // from:
      });
    }
  },
});
