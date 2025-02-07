import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { getWebRequest } from '@tanstack/start/server';
import { auth } from '~/lib/auth';

const logoutFn = createServerFn().handler(async () => {
  const req = getWebRequest();

  if (!req) {
    return null;
  }

  const resp = await auth.api.signOut({
    headers: req.headers,
  });
  // TODO: Manually remove cookie? --verify I don't need to do such

  if (!resp.success) {
    throw new Error('Something went wrong signing out!');
  }

  throw redirect({
    href: '/',
  });
});

export const Route = createFileRoute('/logout')({
  preload: false,
  loader: () => logoutFn(),
});
