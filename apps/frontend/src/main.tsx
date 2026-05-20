import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-500.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { App } from './pages/App';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { ShopCartPage } from './pages/ShopCartPage';
import { ShopLayout } from './pages/ShopLayout';
import { ShopPage } from './pages/ShopPage';
import { ShopProductPage } from './pages/ShopProductPage';
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
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/shop',
    element: <ShopLayout />,
    children: [
      {
        index: true,
        element: <ShopPage />,
      },
      {
        path: 'cart',
        element: <ShopCartPage />,
      },
      {
        path: ':productId',
        element: <ShopProductPage />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
