// Все данные приложения хранятся локально на устройстве (IndexedDB) — не передаются на сервер.
import { dbGet, dbGetAll, dbPut, dbDelete, genId } from '@/lib/local-db';
import { scheduleSnapshot } from '@/lib/auto-snapshot';

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
    const saved = await dbPut('hunters', hunter);
    scheduleSnapshot();
    return saved;
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
    const saved = await dbPut('hunters', hunter);
    scheduleSnapshot();
    return saved;
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
  cost: number | null;
}

export const weaponsApi = {
  list: async (hunterId: string) => {
    const all = await dbGetAll<WeaponDto>('weapons');
    return all.filter((w) => w.hunterId === hunterId);
  },
  create: async (data: Record<string, unknown>) => {
    const weapon = { ...data, id: genId() } as WeaponDto;
    const saved = await dbPut('weapons', weapon);
    scheduleSnapshot();
    return saved;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<WeaponDto>('weapons', id);
    const weapon = { ...existing, ...data, id } as WeaponDto;
    const saved = await dbPut('weapons', weapon);
    scheduleSnapshot();
    return saved;
  },
  remove: async (id: string) => {
    await dbDelete('weapons', id);
    scheduleSnapshot();
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
    const saved = await dbPut('medicalCertificates', cert);
    scheduleSnapshot();
    return saved;
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
    const saved = await dbPut('medicalCertificates', cert);
    scheduleSnapshot();
    return saved;
  },
};

export type DocumentType = 'ticket' | 'inspector';

export interface DocumentDto {
  id: string;
  hunterId: string;
  type: DocumentType;
  number: string;
  issueDate: string;
  photo: string;
}

export const documentsApi = {
  get: async (hunterId: string, type: DocumentType) => {
    const all = await dbGetAll<DocumentDto>('documents');
    return all.find((d) => d.hunterId === hunterId && d.type === type) || null;
  },
  create: async (data: Record<string, unknown>) => {
    const doc: DocumentDto = {
      id: genId(),
      hunterId: String(data.hunterId || ''),
      type: (data.type as DocumentType) || 'ticket',
      number: String(data.number || ''),
      issueDate: String(data.issueDate || ''),
      photo: String(data.photo || ''),
    };
    const saved = await dbPut('documents', doc);
    scheduleSnapshot();
    return saved;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<DocumentDto>('documents', id);
    const doc: DocumentDto = {
      id,
      hunterId: existing?.hunterId || String(data.hunterId || ''),
      type: (data.type as DocumentType) ?? existing?.type ?? 'ticket',
      number: String(data.number ?? existing?.number ?? ''),
      issueDate: String(data.issueDate ?? existing?.issueDate ?? ''),
      photo: String(data.photo ?? existing?.photo ?? ''),
    };
    const saved = await dbPut('documents', doc);
    scheduleSnapshot();
    return saved;
  },
};

export interface CarUpgradeDto {
  id: string;
  name: string;
  note: string;
}

export interface MaintenanceDto {
  id: string;
  date: string;
  description: string;
  cost: number;
}

export interface CarDto {
  id: string;
  hunterId: string;
  brand: string;
  plate: string;
  photo: string;
  upgrades: CarUpgradeDto[];
  maintenance: MaintenanceDto[];
}

export const MAX_CARS_PER_HUNTER = 5;

export const carsApi = {
  list: async (hunterId: string) => {
    const all = await dbGetAll<CarDto>('cars');
    return all.filter((c) => c.hunterId === hunterId);
  },
  create: async (data: Record<string, unknown>) => {
    const hunterId = String(data.hunterId || '');
    const existing = await dbGetAll<CarDto>('cars');
    const count = existing.filter((c) => c.hunterId === hunterId).length;
    if (count >= MAX_CARS_PER_HUNTER) {
      throw new Error(`Можно добавить не более ${MAX_CARS_PER_HUNTER} автомобилей`);
    }
    const car: CarDto = {
      id: genId(),
      hunterId,
      brand: String(data.brand || ''),
      plate: String(data.plate || ''),
      photo: String(data.photo || ''),
      upgrades: (data.upgrades as CarUpgradeDto[]) || [],
      maintenance: (data.maintenance as MaintenanceDto[]) || [],
    };
    const saved = await dbPut('cars', car);
    scheduleSnapshot();
    return saved;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<CarDto>('cars', id);
    const car: CarDto = {
      id,
      hunterId: existing?.hunterId || String(data.hunterId || ''),
      brand: String(data.brand ?? existing?.brand ?? ''),
      plate: String(data.plate ?? existing?.plate ?? ''),
      photo: String(data.photo ?? existing?.photo ?? ''),
      upgrades: (data.upgrades as CarUpgradeDto[]) ?? existing?.upgrades ?? [],
      maintenance: (data.maintenance as MaintenanceDto[]) ?? existing?.maintenance ?? [],
    };
    const saved = await dbPut('cars', car);
    scheduleSnapshot();
    return saved;
  },
  remove: async (id: string) => {
    await dbDelete('cars', id);
    scheduleSnapshot();
    return { ok: true };
  },
};

export type AccessoryItemType = 'binoculars' | 'thermal_device' | 'other';

export interface AccessoryItemDto {
  id: string;
  hunterId: string;
  type: AccessoryItemType;
  name: string;
  params: string;
  photo: string;
  cost: number | null;
}

export const accessoryItemsApi = {
  list: async (hunterId: string) => {
    const all = await dbGetAll<AccessoryItemDto>('accessories');
    return all.filter((a) => a.hunterId === hunterId);
  },
  create: async (data: Record<string, unknown>) => {
    const item: AccessoryItemDto = {
      id: genId(),
      hunterId: String(data.hunterId || ''),
      type: (data.type as AccessoryItemType) || 'other',
      name: String(data.name || ''),
      params: String(data.params || ''),
      photo: String(data.photo || ''),
      cost: data.cost === null || data.cost === undefined || data.cost === '' ? null : Number(data.cost),
    };
    const saved = await dbPut('accessories', item);
    scheduleSnapshot();
    return saved;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<AccessoryItemDto>('accessories', id);
    const item: AccessoryItemDto = {
      id,
      hunterId: existing?.hunterId || String(data.hunterId || ''),
      type: (data.type as AccessoryItemType) ?? existing?.type ?? 'other',
      name: String(data.name ?? existing?.name ?? ''),
      params: String(data.params ?? existing?.params ?? ''),
      photo: String(data.photo ?? existing?.photo ?? ''),
      cost:
        data.cost === null || data.cost === undefined || data.cost === ''
          ? existing?.cost ?? null
          : Number(data.cost),
    };
    const saved = await dbPut('accessories', item);
    scheduleSnapshot();
    return saved;
  },
  remove: async (id: string) => {
    await dbDelete('accessories', id);
    scheduleSnapshot();
    return { ok: true };
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
    const saved = await dbPut('huntEvents', event);
    scheduleSnapshot();
    return saved;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const existing = await dbGet<HuntEventDto>('huntEvents', id);
    const event = { ...existing, ...data, id } as HuntEventDto;
    const saved = await dbPut('huntEvents', event);
    scheduleSnapshot();
    return saved;
  },
  remove: async (id: string) => {
    await dbDelete('huntEvents', id);
    scheduleSnapshot();
    return { ok: true };
  },
};