import { Link } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';

export function NotFound({ children }: PropsWithChildren) {
  return (
    <div className="space-y-2 p-6 rounded-lg shadow-lg bg-white dark:bg-gray-900 text-black dark:text-white max-w-md mx-auto mt-12">
      <div className="text-gray-600 dark:text-gray-400">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <p className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="cursor-pointer rounded-sm bg-cyan-600 px-2 py-1 font-black text-sm text-white uppercase hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors"
        >
          Go back
        </button>
        <Link
          to="/"
          className="cursor-pointer rounded-sm bg-cyan-600 px-2 py-1 font-black text-sm text-white uppercase hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors"
        >
          Start Over
        </Link>
      </p>
    </div>
  );
}
