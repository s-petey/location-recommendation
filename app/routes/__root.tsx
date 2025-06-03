import type { QueryClient } from '@tanstack/react-query';
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useMatch,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import * as React from 'react';
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary.js';
import { NotFound } from '~/components/NotFound.js';
import { auth } from '~/lib/auth.js';
import { env } from '~/lib/env.js';
import appCss from '~/styles/app.css?url';
import { seo } from '~/utils/seo.js';

interface MyRouterContext {
  queryClient: QueryClient;
}

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

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Location Recommendation',
      },
      ...seo({
        title: 'Location Recommendation | Leave decision fatigue behind',
        description: 'Give us a category we make a decision for you.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: '/favicon-96x96.png',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'shortcut icon',
        href: '/favicon.ico',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),

  loader: async ({ context }) => {
    const fullSession = await fetchBetterAuth();

    return {
      ...context,
      ...fullSession,
    };
  },
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.StrictMode>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </React.StrictMode>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const data = Route.useLoaderData();
  const matchLogin = useMatch({
    from: '/login',
    shouldThrow: false,
  });

  const matchSignup = useMatch({
    from: '/signup',
    shouldThrow: false,
  });

  const matchesLoginOrSignup =
    matchLogin?.status === 'success' || matchSignup?.status === 'success';

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {!matchesLoginOrSignup && (
          <div className="flex gap-2 p-2 text-lg">
            <Link
              to="/"
              activeProps={{
                className: 'font-bold',
              }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>{' '}
            <Link
              to="/category"
              activeProps={{
                className: 'font-bold',
              }}
              disabled={!data?.user}
              className={!data?.user ? 'pointer-events-none opacity-50' : ''}
            >
              Category
            </Link>{' '}
            <div className="ml-auto">
              {data?.user ? (
                <>
                  <span className="mr-2">{data.user.email}</span>
                  <Link to="/logout">Logout</Link>
                </>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </div>
          </div>
        )}
        <hr />

        {children}

        {env.DEV_TOOLS && <LazyDevTools />}
        <Scripts />
      </body>
    </html>
  );
}

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools').then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

const TanStackRouterDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-router-devtools').then((d) => ({
    default: d.TanStackRouterDevtools,
  })),
);

function LazyDevTools() {
  return (
    <React.Suspense fallback={null}>
      <ReactQueryDevtoolsProduction buttonPosition="bottom-left" />
      <TanStackRouterDevtoolsProduction position="bottom-right" />
    </React.Suspense>
  );
}
