import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const resolveBasePath = () => {
  const configuredBasePath = process.env.VITE_APP_BASE_PATH?.trim() ?? '';

  if (!configuredBasePath || configuredBasePath === '/') {
    return '/';
  }

  return `/${configuredBasePath.replace(/^\/+|\/+$/g, '')}/`;
};

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
