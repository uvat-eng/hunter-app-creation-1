import func2url from '../../backend/func2url.json';

const urls = func2url as Record<string, string>;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Ошибка запроса: ${res.status}`);
  }
  return res.json();
}

export interface HunterDto {
  id: string;
  name: string;
  city: string;
  ticket: string;
  ticket_date: string | null;
  photo: string;
  experience: string;
  weapon: string;
  game: string;
}

export const huntersApi = {
  get: (id: string) => request<HunterDto>(`${urls.hunters}?id=${id}`),
  create: (data: Record<string, unknown>) =>
    request<HunterDto>(urls.hunters, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<HunterDto>(urls.hunters, { method: 'PUT', body: JSON.stringify({ ...data, id }) }),
};

export interface AccessoryDto {
  name: string;
  params: string;
}

export interface WeaponDto {
  id: string;
  hunterId: string;
  name: string;
  caliber: string;
  permit: string;
  permitDate: string;
  optics: AccessoryDto | null;
  thermal: AccessoryDto | null;
  collimator: AccessoryDto | null;
}

export const weaponsApi = {
  list: (hunterId: string) => request<WeaponDto[]>(`${urls.weapons}?hunterId=${hunterId}`),
  create: (data: Record<string, unknown>) =>
    request<WeaponDto>(urls.weapons, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<WeaponDto>(urls.weapons, { method: 'PUT', body: JSON.stringify({ ...data, id }) }),
  remove: (id: string) => request<{ ok: boolean }>(`${urls.weapons}?id=${id}`, { method: 'DELETE' }),
};

export interface BookingDto {
  id: string;
  hunterId: string | null;
  date: string;
  services: string[];
  total: number;
}

export const bookingsApi = {
  list: (hunterId?: string) =>
    request<BookingDto[]>(hunterId ? `${urls.bookings}?hunterId=${hunterId}` : urls.bookings),
  create: (data: Record<string, unknown>) =>
    request<BookingDto>(urls.bookings, { method: 'POST', body: JSON.stringify(data) }),
};

export interface TrophyDto {
  game: string;
  count: string;
}

export interface HuntEventDto {
  id: string;
  hunterId: string;
  title: string;
  huntType: string;
  date: string;
  status: 'planned' | 'done';
  locationName: string;
  mapX: number | null;
  mapY: number | null;
  notes: string;
  reminder: boolean;
  trophies: TrophyDto[];
  photos: string[];
}

export const huntEventsApi = {
  list: (hunterId: string) => request<HuntEventDto[]>(`${urls['hunt-events']}?hunterId=${hunterId}`),
  create: (data: Record<string, unknown>) =>
    request<HuntEventDto>(urls['hunt-events'], { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<HuntEventDto>(urls['hunt-events'], { method: 'PUT', body: JSON.stringify({ ...data, id }) }),
  remove: (id: string) => request<{ ok: boolean }>(`${urls['hunt-events']}?id=${id}`, { method: 'DELETE' }),
};