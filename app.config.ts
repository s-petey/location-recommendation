import { loadEnvFile } from 'node:process';
import { defineConfig } from '@tanstack/start/config';
import tsConfigPaths from 'vite-tsconfig-paths';

loadEnvFile();

export default defineConfig({
  server: {
    preset: 'node-server',
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
});
