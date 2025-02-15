import {
  queryOptions,
  skipToken,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  Outlet,
  createFileRoute,
  notFound,
  useNavigate,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { type } from 'arktype';
import { useState } from 'react';
import { categorySchema, searchboxQuerySchema } from '~/lib/category';
import { env } from '~/lib/env';

export const Route = createFileRoute('/_authed/category')({
  component: RouteComponent,
});

type FormErrors = Partial<{
  category: string;
  limit: string;
  proximity: string;
}>;

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const [errors, setErrors] = useState<FormErrors>({});

  // TODO: Hoist the form state into the URL bar, so it can persist on submit?
  const [formState, setFormState] = useState<{
    category: string;
    limit: number;
    longLat: [number, number] | null;
  }>({
    category: '',
    limit: 1,
    longLat: null,
  });

  function requestGeoLocation() {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
      enableHighAccuracy: true,
      maximumAge: 0,
    });
  }

  const geoSuccess: PositionCallback = (position) => {
    const { latitude, longitude } = position.coords;

    setFormState((prev) => ({
      ...prev,
      longLat: [longitude, latitude],
    }));
  };

  const geoError: PositionErrorCallback = (error) => {
    console.error(error);
    // TODO....
    setErrors({
      proximity: error.message,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <form
        className="grid grid-cols-1 gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const { category: rawCategory, limit, longLat } = formState;

          const category = categorySchema(rawCategory);

          if (category instanceof type.errors) {
            setErrors({
              category: category.summary,
            });
            return;
          }

          if (!longLat) {
            setErrors({
              proximity: 'Proximity is required',
            });
            return;
          }

          const result = searchboxQuerySchema.pick('limit')({
            limit: Number(limit),
          });

          if (result instanceof type.errors) {
            setErrors({
              limit: result.summary,
            });
            return;
          }

          setErrors({});

          navigate({
            to: '/category/$name',
            params: { name: category },
            search: () => ({
              category,
              proximity: longLat,
              limit: result.limit,
            }),
          });
        }}
      >
        <label className="block" htmlFor="category">
          Category
          <input
            className="block appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:col-span-2 sm:mt-0"
            type="text"
            name="category"
            id="category"
            placeholder="café"
            required={true}
            value={formState.category}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                category: event.target.value,
              }))
            }
          />
          {(errors.category ?? '').length > 0 && (
            <p className="mt-2 text-red-600 text-sm">{errors.category}</p>
          )}
        </label>

        <div className="flex gap-4">
          <label htmlFor="longitude">
            Longitude
            <input
              className="block appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              type="number"
              name="longitude"
              id="longitude"
              required={true}
              value={formState.longLat?.at(0) ?? ''}
            />
          </label>
          <label htmlFor="latitude">
            Latitude
            <input
              className="block appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              type="number"
              name="latitude"
              id="latitude"
              required={true}
              value={formState.longLat?.at(1) ?? ''}
            />
          </label>
        </div>

        <div>
          <button
            className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            type="button"
            onClick={requestGeoLocation}
          >
            Use current location
          </button>
          {(errors.proximity ?? '').length > 0 && (
            <p className="mt-2 text-red-600 text-sm">
              Error: {errors.proximity}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <button
            className={`rounded-l-md border border-gray-300 bg-gray-200 px-4 py-2 text-gray-500 duration-150 hover:bg-gray-300 ${
              formState.limit < 2 && 'pointer-events-none opacity-50'
            }`}
            disabled={formState.limit < 2}
            type="button"
            onClick={() => {
              if (formState.limit > 2) {
                setFormState((prev) => ({
                  ...prev,
                  limit: prev.limit - 1,
                }));
              }
            }}
          >
            &#8722;
          </button>
          <input
            className="appearance-none rounded-none border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            type="number"
            name="limit"
            id="limit"
            value={formState.limit}
            min={1}
            max={25}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                limit: Number.parseInt(e.target.value, 10),
              }))
            }
          />
          <button
            className={`rounded-r-md border border-gray-300 bg-gray-200 px-4 py-2 text-gray-500 hover:bg-gray-300 ${
              formState.limit >= 25 && 'pointer-events-none opacity-50'
            }`}
            disabled={formState.limit >= 25}
            type="button"
            onClick={() => {
              if (formState.limit < 25) {
                setFormState((prev) => ({
                  ...prev,
                  limit: prev.limit + 1,
                }));
              }
            }}
          >
            &#43;
          </button>
          {(errors.limit ?? '').length > 0 && (
            <p className="mt-2 text-red-600 text-sm">{errors.limit}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="submit"
          >
            Search
          </button>
          <button
            className="rounded-md border border-transparent bg-gray-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            type="button"
            onClick={() => {
              setFormState((prev) => ({
                ...prev,
                longLat: null,
              }));
              navigate({
                to: '/category',
              });
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <Outlet />
    </div>
  );
}
