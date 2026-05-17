import { queryOptions } from '@tanstack/react-query';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type UserItem = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type SessionResponse = {
  authenticated: true;
  user: SessionUser;
};

type ApiErrorResponse = {
  message?: string;
};

type RegisterPayload = {
  email: string;
  name: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const parseJson = async <T>(response: Response) => (await response.json()) as T;

const throwApiError = async (response: Response, fallbackMessage: string): Promise<never> => {
  const payload = await parseJson<ApiErrorResponse>(response);

  throw new Error(payload.message ?? fallbackMessage);
};

export const queryKeys = {
  session: () => ['session'] as const,
  users: () => ['users'] as const,
};

export const registerUser = async (payload: RegisterPayload): Promise<UserItem> => {
  const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwApiError(response, 'Could not save the user.');
  }

  return parseJson<UserItem>(response);
};

export const loginUser = async (payload: LoginPayload): Promise<SessionResponse> => {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwApiError(response, 'Login failed. Check your credentials.');
  }

  return parseJson<SessionResponse>(response);
};

export const fetchSession = async (): Promise<SessionResponse> => {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'No active session found.');
  }

  return parseJson<SessionResponse>(response);
};

export const logoutUser = async (): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Could not clear the session.');
  }
};

export const fetchUsers = async (): Promise<UserItem[]> => {
  const response = await fetch(`${apiBaseUrl}/api/users`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Could not load users. Sign in first.');
  }

  return parseJson<UserItem[]>(response);
};

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.session(),
    queryFn: fetchSession,
    retry: false,
  });

export const usersQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.users(),
    queryFn: fetchUsers,
    retry: false,
  });
