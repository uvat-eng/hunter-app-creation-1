// Резервное копирование локальных данных приложения в файл и восстановление из него.
import { dbGetAll, dbPut } from '@/lib/local-db';
import type { HunterDto, WeaponDto, HuntEventDto, MedicalCertificateDto } from '@/lib/api';

const HUNTER_ID_KEY = 'hunter_diary_hunter_id';
const BACKUP_VERSION = 1;

interface BackupData {
  version: number;
  exportedAt: string;
  activeHunterId: string | null;
  hunters: HunterDto[];
  weapons: WeaponDto[];
  huntEvents: HuntEventDto[];
  medicalCertificates: MedicalCertificateDto[];
}

export const exportBackup = async (): Promise<void> => {
  const [hunters, weapons, huntEvents, medicalCertificates] = await Promise.all([
    dbGetAll<HunterDto>('hunters'),
    dbGetAll<WeaponDto>('weapons'),
    dbGetAll<HuntEventDto>('huntEvents'),
    dbGetAll<MedicalCertificateDto>('medicalCertificates'),
  ]);

  const data: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    activeHunterId: localStorage.getItem(HUNTER_ID_KEY),
    hunters,
    weapons,
    huntEvents,
    medicalCertificates,
  };

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `hunter-diary-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const importBackup = async (file: File): Promise<{ hunterId: string | null }> => {
  const text = await file.text();
  let data: BackupData;
  try {
    data = JSON.parse(text) as BackupData;
  } catch {
    throw new Error('Файл повреждён или имеет неверный формат');
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.hunters)) {
    throw new Error('Это не похоже на файл резервной копии дневника охотника');
  }

  await Promise.all([
    ...data.hunters.map((h) => dbPut('hunters', h)),
    ...(data.weapons || []).map((w) => dbPut('weapons', w)),
    ...(data.huntEvents || []).map((e) => dbPut('huntEvents', e)),
    ...(data.medicalCertificates || []).map((c) => dbPut('medicalCertificates', c)),
  ]);

  const hunterId = data.activeHunterId || data.hunters[0]?.id || null;
  if (hunterId) localStorage.setItem(HUNTER_ID_KEY, hunterId);
  return { hunterId };
};
