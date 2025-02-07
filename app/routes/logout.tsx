import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { getEvent, getWebRequest, setCookie } from '@tanstack/start/server';
import { auth } from '~/lib/auth';
import { createCookieForServerAuth } from '~/lib/auth.helpers';

const logoutFn = createServerFn().handler(async () => {
  const req = getWebRequest();

  if (!req) {
    return null;
  }

  const resp = await auth.api.signOut({
    headers: req.headers,
    asResponse: true,
  });

  if (!resp.ok) {
    throw new Error('Something went wrong signing out!');
  }

  const headers = resp.headers;

  const cookiesToSet = createCookieForServerAuth(headers);
  const event = getEvent();

  for (const { key, value, options } of cookiesToSet) {
    // "set" here a cookie with an immediate timeout.
    setCookie(event, key, value, options);
  }

  throw redirect({
    href: '/',
  });
});

export const Route = createFileRoute('/logout')({
  preload: false,
  loader: () => logoutFn(),
});
