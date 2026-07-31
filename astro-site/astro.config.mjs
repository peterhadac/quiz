import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

export default defineConfig({
  base: '/quiz/',
  integrations: [react()],
  vite: {
    resolve: {
      alias: [
        { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, 'src', '$1') },
        { find: '@components', replacement: path.resolve(__dirname, 'src', 'components') },
      ],
    },
  },
});
