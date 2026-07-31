import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['../tests/**/*.test.ts', '../tests/**/*.test.tsx', 'src/**/*.test.tsx'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, 'src', '$1') },
      { find: '@components', replacement: path.resolve(__dirname, 'src', 'components') },
    ],
  },
});
