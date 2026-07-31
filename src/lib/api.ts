// Все данные приложения хранятся локально на устройстве (IndexedDB) — не передаются на сервер.
import { dbGet, dbGetAll, dbPut, dbDelete, genId } from '@/lib/local-db';

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
  get: async (id: string) => {
    const h = await dbGet<HunterDto>('hunters', id);
    if (!h) throw new Error('not found');
    return h;
  },
  create: async (data: Record<string, unknown>) => {
    const hunter: HunterDto = {
      id: genId(),
      name: String(data.name || ''),
      city: String(data.city || ''),
      ticket: String(data.ticket || ''),
      ticket_date: (data.ticketDate as string) || null,
      photo: String(data.photo || ''),
      experience: String(data.experience || ''),
      weapon: String(data.weapon || ''),
      game: String(data.game || ''),
    };
    return dbPut('hunters', hunter);
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<HunterDto>('hunters', id);
    const hunter: HunterDto = {
      id,
      name: String(data.name ?? existing?.name ?? ''),
      city: String(data.city ?? existing?.city ?? ''),
      ticket: String(data.ticket ?? existing?.ticket ?? ''),
      ticket_date: (data.ticketDate as string) ?? existing?.ticket_date ?? null,
      photo: String(data.photo ?? existing?.photo ?? ''),
      experience: String(data.experience ?? existing?.experience ?? ''),
      weapon: String(data.weapon ?? existing?.weapon ?? ''),
      game: String(data.game ?? existing?.game ?? ''),
    };
    return dbPut('hunters', hunter);
  },
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
  photo: string;
  permitPhoto: string;
}

export const weaponsApi = {
  list: async (hunterId: string) => {
    const all = await dbGetAll<WeaponDto>('weapons');
    return all.filter((w) => w.hunterId === hunterId);
  },
  create: async (data: Record<string, unknown>) => {
    const weapon = { ...data, id: genId() } as WeaponDto;
    return dbPut('weapons', weapon);
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<WeaponDto>('weapons', id);
    const weapon = { ...existing, ...data, id } as WeaponDto;
    return dbPut('weapons', weapon);
  },
  remove: async (id: string) => {
    await dbDelete('weapons', id);
    return { ok: true };
  },
};

export interface MedicalCertificateDto {
  id: string;
  hunterId: string;
  number: string;
  issueDate: string;
  expiresDate: string;
  photo: string;
}

const CERT_VALID_YEARS = 5;

const withExpiresDate = (issueDate: string): string => {
  if (!issueDate) return '';
  const d = new Date(issueDate);
  d.setFullYear(d.getFullYear() + CERT_VALID_YEARS);
  return d.toISOString().slice(0, 10);
};

export const medicalCertificatesApi = {
  get: async (hunterId: string) => {
    const all = await dbGetAll<MedicalCertificateDto>('medicalCertificates');
    const found = all.find((c) => c.hunterId === hunterId);
    return found || null;
  },
  create: async (data: Record<string, unknown>) => {
    const issueDate = String(data.issueDate || '');
    const cert: MedicalCertificateDto = {
      id: genId(),
      hunterId: String(data.hunterId || ''),
      number: String(data.number || ''),
      issueDate,
      expiresDate: withExpiresDate(issueDate),
      photo: String(data.photo || ''),
    };
    return dbPut('medicalCertificates', cert);
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<MedicalCertificateDto>('medicalCertificates', id);
    const issueDate = String(data.issueDate ?? existing?.issueDate ?? '');
    const cert: MedicalCertificateDto = {
      id,
      hunterId: existing?.hunterId || String(data.hunterId || ''),
      number: String(data.number ?? existing?.number ?? ''),
      issueDate,
      expiresDate: withExpiresDate(issueDate),
      photo: String(data.photo ?? existing?.photo ?? ''),
    };
    return dbPut('medicalCertificates', cert);
  },
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
  lat: number | null;
  lng: number | null;
  region: string;
  notes: string;
  reminder: boolean;
  trophies: TrophyDto[];
  photos: string[];
  videos: string[];
  budget: number | null;
}

export const huntEventsApi = {
  list: async (hunterId: string) => {
    const all = await dbGetAll<HuntEventDto>('huntEvents');
    return all
      .filter((e) => e.hunterId === hunterId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  },
  create: async (data: Record<string, unknown>) => {
    const event = { ...data, id: genId() } as HuntEventDto;
    return dbPut('huntEvents', event);
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<HuntEventDto>('huntEvents', id);
    const event = { ...existing, ...data, id } as HuntEventDto;
    return dbPut('huntEvents', event);
  },
  remove: async (id: string) => {
    await dbDelete('huntEvents', id);
    return { ok: true };
  },
};
