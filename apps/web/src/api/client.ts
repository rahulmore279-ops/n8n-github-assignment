const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export type PublicUser = { id: string; username: string; fullName: string; role: string };

export type LoginResponse = {
  token: string;
  user: PublicUser;
};

export type Hall = {
  id: string;
  name: string;
  code: string;
  capacity: number;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HallInput = {
  name: string;
  code: string;
  capacity: number;
  description?: string | null;
  active?: boolean;
};

export type HallAvailability = {
  hallId: string;
  date: string;
  available: boolean;
  active: boolean;
  reason: string | null;
};

async function parseJson(response: Response): Promise<unknown> {
  return response.status === 204 ? {} : response.json().catch(() => ({}));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options);
  const body = await parseJson(response) as { message?: string };
  if (!response.ok) {
    throw new Error(body.message ?? 'Request failed. Please try again.');
  }
  return body as T;
}

function authHeaders(token: string, extraHeaders: HeadersInit = {}): HeadersInit {
  return { ...extraHeaders, Authorization: `Bearer ${token}` };
}

export function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
}

export function getCurrentUser(token: string): Promise<{ user: PublicUser }> {
  return request<{ user: PublicUser }>('/auth/me', {
    headers: authHeaders(token)
  });
}

export function logout(token: string): Promise<void> {
  return request<void>('/auth/logout', {
    method: 'POST',
    headers: authHeaders(token)
  });
}

export function listHalls(token: string): Promise<{ halls: Hall[] }> {
  return request<{ halls: Hall[] }>('/halls', { headers: authHeaders(token) });
}

export function getHallAvailability(token: string, hallId: string, date: string): Promise<HallAvailability> {
  const params = new URLSearchParams({ hallId, date });
  return request<HallAvailability>(`/halls/availability?${params.toString()}`, { headers: authHeaders(token) });
}

export function createHall(token: string, hall: HallInput): Promise<{ hall: Hall }> {
  return request<{ hall: Hall }>('/halls', {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(hall)
  });
}

export function updateHall(token: string, id: string, hall: HallInput): Promise<{ hall: Hall }> {
  return request<{ hall: Hall }>(`/halls/${id}`, {
    method: 'PUT',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(hall)
  });
}

export function setHallStatus(token: string, id: string, active: boolean): Promise<{ hall: Hall }> {
  return request<{ hall: Hall }>(`/halls/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ active })
  });
}
