// Резервное копирование локальных данных приложения в файл и восстановление из него.
import { dbGetAll, dbPut } from '@/lib/local-db';
import { isNativeApp } from '@/lib/native';
import type { HunterDto, WeaponDto, HuntEventDto, MedicalCertificateDto, DocumentDto, CarDto, AccessoryItemDto } from '@/lib/api';

const HUNTER_ID_KEY = 'hunter_diary_hunter_id';
const BACKUP_VERSION = 3;

interface BackupData {
  version: number;
  exportedAt: string;
  activeHunterId: string | null;
  hunters: HunterDto[];
  weapons: WeaponDto[];
  huntEvents: HuntEventDto[];
  medicalCertificates: MedicalCertificateDto[];
  documents: DocumentDto[];
  cars: CarDto[];
  accessories: AccessoryItemDto[];
}

export const exportBackup = async (): Promise<void> => {
  const [hunters, weapons, huntEvents, medicalCertificates, documents, cars, accessories] = await Promise.all([
    dbGetAll<HunterDto>('hunters'),
    dbGetAll<WeaponDto>('weapons'),
    dbGetAll<HuntEventDto>('huntEvents'),
    dbGetAll<MedicalCertificateDto>('medicalCertificates'),
    dbGetAll<DocumentDto>('documents'),
    dbGetAll<CarDto>('cars'),
    dbGetAll<AccessoryItemDto>('accessories'),
  ]);

  const data: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    activeHunterId: localStorage.getItem(HUNTER_ID_KEY),
    hunters,
    weapons,
    huntEvents,
    medicalCertificates,
    documents,
    cars,
    accessories,
  };

  const date = new Date().toISOString().slice(0, 10);
  const fileName = `hunter-diary-backup-${date}.json`;
  const json = JSON.stringify(data);

  if (isNativeApp) {
    // В нативном Android-приложении обычное скачивание через <a download> не создаёт файл —
    // WebView его не перехватывает. Поэтому пишем файл напрямую в память телефона (папка
    // "Документы"), без каких-либо облаков и сторонних сервисов — данные не покидают устройство.
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    try {
      const perm = await Filesystem.checkPermissions();
      if (perm.publicStorage !== 'granted') {
        await Filesystem.requestPermissions();
      }
    } catch {
      /* на Android 11+ разрешение не требуется для собственных файлов приложения */
    }
    await Filesystem.writeFile({
      path: fileName,
      directory: Directory.Documents,
      data: json,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    return;
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
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
    ...(data.documents || []).map((d) => dbPut('documents', d)),
    ...(data.cars || []).map((c) => dbPut('cars', c)),
    ...(data.accessories || []).map((a) => dbPut('accessories', a)),
  ]);

  const hunterId = data.activeHunterId || data.hunters[0]?.id || null;
  if (hunterId) localStorage.setItem(HUNTER_ID_KEY, hunterId);
  return { hunterId };
};