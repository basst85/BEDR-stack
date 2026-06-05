import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-500.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-700.css';
import '@fontsource/open-sans/latin-800.css';

import { LocaleProvider, LocaleRedirect, withAppBasePath } from '@/lib/i18n';
import { App } from './pages/App';
import { AboutPage } from './pages/AboutPage';
import { BookingPage } from './pages/BookingPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TermsPage } from './pages/TermsPage';
import { BmsAdminPage } from './pages/BmsAdminPage';
import { queryClient } from '@/lib/query-client';
import './styles/global.css';

document.documentElement.classList.add('dark');

function LocalizedApp() {
  return (
    <LocaleProvider>
      <App />
    </LocaleProvider>
  );
}

const router = createBrowserRouter([
  {
    path: withAppBasePath('/'),
    element: <LocaleRedirect />,
  },
  {
    path: withAppBasePath('/boeken'),
    element: <LocaleRedirect />,
  },
  {
    path: withAppBasePath('/voorwaarden'),
    element: <LocaleRedirect />,
  },
  {
    path: withAppBasePath('/over-ons'),
    element: <LocaleRedirect />,
  },
  {
    element: <LocalizedApp />,
    children: [
      {
        path: withAppBasePath('/:locale'),
        element: <HomePage />,
      },
      {
        path: withAppBasePath('/:locale/boeken'),
        element: <BookingPage />,
      },
      {
        path: withAppBasePath('/:locale/voorwaarden'),
        element: <TermsPage />,
      },
      {
        path: withAppBasePath('/:locale/over-ons'),
        element: <AboutPage />,
      },
      {
        path: withAppBasePath('/:locale/*'),
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: withAppBasePath('/bms-admin'),
    element: <BmsAdminPage />,
  },
  {
    path: withAppBasePath('*'),
    element: <NotFoundPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
