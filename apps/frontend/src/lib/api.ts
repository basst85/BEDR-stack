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

export type BookingAvailabilityItem = {
  unitType: string;
  title: string;
  stockLimit: number;
  reserved: number;
  remaining: number;
};

export type BookingRequestPayload = {
  unitType: string;
  quantity: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  notes?: string;
};

export type BookingConfirmation = {
  id: string;
  confirmationCode: string;
  unitType: string;
  quantity: number;
  status: 'pending';
  remaining: number;
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
  bookingAvailability: () => ['booking-availability'] as const,
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

export const fetchBookingAvailability = async (): Promise<BookingAvailabilityItem[]> => {
  const response = await fetch(`${apiBaseUrl}/api/bookings/availability`);

  if (!response.ok) {
    return throwApiError(response, 'Could not load the unit availability.');
  }

  return parseJson<BookingAvailabilityItem[]>(response);
};

export const submitBookingRequest = async (
  payload: BookingRequestPayload,
): Promise<BookingConfirmation> => {
  const response = await fetch(`${apiBaseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwApiError(response, 'Could not save the booking request.');
  }

  return parseJson<BookingConfirmation>(response);
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

export const bookingAvailabilityQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.bookingAvailability(),
    queryFn: fetchBookingAvailability,
    retry: false,
  });
