import { treaty } from '@elysiajs/eden';

import type { App } from '@backend/server';

export type { App } from '@backend/server';

export const createApiClient = (baseUrl: string) => treaty<App>(baseUrl);
