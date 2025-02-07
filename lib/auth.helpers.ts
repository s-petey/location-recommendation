import type { setCookie } from '@tanstack/start/server';
import { type } from 'arktype';
import { parseSetCookieHeader } from 'better-auth';

type CookieOpts = Parameters<typeof setCookie>['3'];

// WARNING: This is mostly a copy of `next-js` in better-auth.
// import { nextCookies } from 'better-auth/next-js';
export function createCookieForServerAuth(headers: Headers) {
  const cookies: {
    key: string;
    value: string;
    options: CookieOpts;
  }[] = [];
  const setCookies = headers?.get('set-cookie');

  if (!setCookies) return cookies;

  const parsed = parseSetCookieHeader(setCookies);

  for (const [key, value] of parsed) {
    if (!key) continue;

    const opts: CookieOpts = {
      sameSite: value.samesite,
      secure: value.secure,
      maxAge: value['max-age'],
      httpOnly: value.httponly,
      domain: value.domain,
      path: value.path,
    };

    cookies.push({
      key,
      value: decodeURIComponent(value.value),
      options: opts,
    });
  }

  return cookies;
}

export const emailAuthSchema = type({
  email: 'string.email',
  password: 'string >= 12',
  'redirectUrl?': 'string',
});

export type EmailAuth = typeof emailAuthSchema.infer;
