import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const defaultSiteUrl = 'https://crossvillagezeddam.com';

const normalizeSiteUrl = (configuredSiteUrl: string | undefined) => {
  const normalizedValue = configuredSiteUrl?.trim() ?? '';

  if (!normalizedValue) {
    return defaultSiteUrl;
  }

  return normalizedValue.replace(/^\/+/, '').replace(/\/$/, '');
};

const normalizeBasePath = (configuredBasePath: string | undefined) => {
  const normalizedValue = configuredBasePath?.trim() ?? '';

  if (!normalizedValue || normalizedValue === '/') {
    return '/';
  }

  return `/${normalizedValue.replace(/^\/+|\/+$/g, '')}/`;
};

const resolveBasePath = () => normalizeBasePath(process.env.VITE_APP_BASE_PATH);

const buildPublicAssetUrl = (assetPath: string) => {
  const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL);
  const basePath = resolveBasePath();
  const normalizedAssetPath = assetPath.replace(/^\/+/, '');

  return new URL(`${basePath === '/' ? '' : basePath}${normalizedAssetPath}`, `${siteUrl}/`).toString();
};

export default defineConfig({
  base: resolveBasePath(),
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-social-meta-image',
      transformIndexHtml(html) {
        return html.replaceAll('__SOCIAL_IMAGE_URL__', buildPublicAssetUrl('logo-crossvillage.jpg'));
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
});
