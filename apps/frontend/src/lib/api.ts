import { queryOptions } from '@tanstack/react-query';

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, '');

const resolveApiBaseUrl = () => {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl) {
    return normalizeBaseUrl(configuredApiUrl);
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return normalizeBaseUrl(window.location.origin);
  }

  return '';
};

export const apiBaseUrl = resolveApiBaseUrl();

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
  remaining: number;
};

export type BookingRequestLinePayload = {
  unitType: string;
  quantity: number;
};

export type BookingRequestPayload = {
  lines: BookingRequestLinePayload[];
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
  lines: Array<{
    unitType: string;
    quantity: number;
    remaining: number;
  }>;
  status: 'pending';
};

export type BmsSessionResponse = {
  authenticated: boolean;
  user?: string;
};

export type BmsBookingItem = {
  id: string;
  requestGroupId: string;
  confirmationCode: string | null;
  unitType: string;
  quantity: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  notes: string | null;
  status: string;
  createdAt: string;
};

export type BmsStockItem = {
  unitType: string;
  title: string;
  defaultStock: number;
  customStock: number | null;
  totalStock: number;
  reserved: number;
  remaining: number;
  isOverridden: boolean;
};

export type BmsLoginPayload = {
  username: string;
  password: string;
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

export const loginBms = async (payload: BmsLoginPayload): Promise<BmsSessionResponse> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwApiError(response, 'Inloggen mislukt. Controleer uw inloggegevens.');
  }

  return parseJson<BmsSessionResponse>(response);
};

export const fetchBmsSession = async (): Promise<BmsSessionResponse> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Geen actieve BMS sessie gevonden.');
  }

  return parseJson<BmsSessionResponse>(response);
};

export const logoutBms = async (): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Kon de sessie niet beëindigen.');
  }
};

export const fetchBmsBookings = async (): Promise<BmsBookingItem[]> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/bookings`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Kon de boekingen niet laden.');
  }

  return parseJson<BmsBookingItem[]>(response);
};

export const cancelBmsBooking = async (requestGroupId: string): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/bookings/${requestGroupId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Kon de boeking niet annuleren.');
  }
};

export const deleteBmsBooking = async (requestGroupId: string): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/bookings/${requestGroupId}/permanent`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Kon de boeking niet definitief verwijderen.');
  }
};

export const approveBmsBooking = async (requestGroupId: string): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/bookings/${requestGroupId}/approve`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Kon de boeking niet accorderen.');
  }
};

export const fetchBmsStocks = async (): Promise<BmsStockItem[]> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/stocks`, {
    credentials: 'include',
  });

  if (!response.ok) {
    return throwApiError(response, 'Kon de voorraden niet laden.');
  }

  return parseJson<BmsStockItem[]>(response);
};

export const updateBmsStock = async (payload: { unitType: string; stock: number }): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/api/bms/stocks`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwApiError(response, 'Kon de voorraad niet bijwerken.');
  }
};
