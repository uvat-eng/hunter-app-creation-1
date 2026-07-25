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
