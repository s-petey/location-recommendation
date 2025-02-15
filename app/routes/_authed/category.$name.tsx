import {
  queryOptions,
  skipToken,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { type } from 'arktype';
import { useState } from 'react';
import {
  type FetchSearchbox,
  categorySchema,
  searchBoxParamsSchema,
  searchboxQuerySchema,
  searchboxSchema,
} from '~/lib/category';
import { env } from '~/lib/env';

export const Route = createFileRoute('/_authed/category/$name')({
  loaderDeps: ({ search }) => search,
  loader: async ({
    params: { name: category },
    context,
    deps: { limit, proximity },
  }) => {
    const parsedCategory = categorySchema(category);

    if (parsedCategory instanceof type.errors) {
      console.error('parseError: ', parsedCategory.summary);
      throw new Error(parsedCategory.summary);
    }

    const data = await context.queryClient.ensureQueryData(
      searchboxQueryOptions({
        category: parsedCategory,
        limit,
        proximity,
      }),
    );

    return data;
  },
  head: ({ params: { name: category } }) => ({
    meta: [{ title: category }],
  }),
  component: RouteComponent,
  validateSearch: searchboxQuerySchema,
});

function RouteComponent() {
  const routeSearch = Route.useSearch();
  const searchboxQuery = useSuspenseQuery(searchboxQueryOptions(routeSearch));

  if (searchboxQuery.data === null) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {searchboxQuery.data.features.map((feature) => (
        <div
          key={feature.properties.external_ids.dataplor}
          className="rounded-lg bg-gray-800 p-4 dark:bg-gray-900 dark:text-white"
        >
          <h2 className="font-bold text-lg">{feature.properties.name}</h2>
          <p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${feature.properties.address}`}
              target="_blank"
              rel="noreferrer"
            >
              {feature.properties.address}
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}

const fetchSearchbox = createServerFn({ method: 'GET' })
  .validator((data: FetchSearchbox) => {
    console.log({ data });

    const parsed = searchBoxParamsSchema(data);

    if (parsed instanceof type.errors) {
      console.error('parseError: ', parsed.summary);
      throw new Error(parsed.summary);
    }

    return parsed;
  })
  .handler(async ({ data }) => {
    const { category, limit, proximity } = data;

    // The category needs to be an `_` separated string instead of spaces.
    const underscoredCategory = category.replaceAll(' ', '_');
    const fetchUrl = new URL(
      `https://api.mapbox.com/search/searchbox/v1/category/${underscoredCategory}`,
    );
    // TODO: add access token ENV
    fetchUrl.searchParams.set(
      'access_token',
      'pk.eyJ1Ijoicy1wZXRleSIsImEiOiJjbTZtZWN6ZWcwamd4Mm1wYjI5MGVmYmJrIn0.PvkJ6F2ngc9_iTBBuRB4nw',
    );
    fetchUrl.searchParams.set('limit', limit.toString());
    fetchUrl.searchParams.set('proximity', proximity.join(','));

    console.info('Fetching: ', fetchUrl.toString());

    const responseData = await fetch(fetchUrl);

    if (responseData.status === 404) {
      throw notFound();
    }

    if (!responseData.ok) {
      const body = await responseData.text();
      console.error(body);
      throw new Error('Failed to find your search');
    }

    const json = await responseData.json();

    console.log({ json });

    const parsed = searchboxSchema(json);

    if (parsed instanceof type.errors) {
      throw new Error(parsed.summary);
    }

    return parsed;
  });

function searchboxQueryOptions(params: Partial<FetchSearchbox>) {
  return queryOptions({
    queryKey: [
      'search',
      'searchbox',
      { category: params.category, proximity: params.proximity },
    ],
    queryFn: () => {
      const parsed = searchBoxParamsSchema(params);

      // Enabled is not working so the workaround recommended
      // is to use return null.
      if (parsed instanceof type.errors) {
        console.error('parseError: ', parsed.summary);
        return null;
      }

      const { category, limit, proximity } = parsed;

      return fetchSearchbox({
        data: {
          category,
          limit,
          proximity,
        },
      });
    },
    staleTime: 1000 * 60 * 100,
  });
}
