import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      <ErrorComponent error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            router.invalidate();
          }}
          className={
            'rounded-sm bg-cyan-600 px-2 py-1 font-black text-sm text-white uppercase hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors'
          }
        >
          Try Again
        </button>
        {isRoot ? (
          <Link
            to="/"
            className={
              'rounded-sm bg-cyan-600 px-2 py-1 font-black text-sm text-white uppercase hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors'
            }
          >
            Home
          </Link>
        ) : (
          <Link
            to="/"
            className={
              'rounded-sm bg-cyan-600 px-2 py-1 font-black text-sm text-white uppercase hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors'
            }
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  );
}
