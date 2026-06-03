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

import { App } from './pages/App';
import { BookingPage } from './pages/BookingPage';
import { HomePage } from './pages/HomePage';
import { TermsPage } from './pages/TermsPage';
import { queryClient } from '@/lib/query-client';
import './styles/global.css';

document.documentElement.classList.add('dark');

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'boeken',
        element: <BookingPage />,
      },
      {
        path: 'voorwaarden',
        element: <TermsPage />,
      },
    ],
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