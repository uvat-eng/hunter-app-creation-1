// Автоматический скрытый снимок данных приложения.
//
// Зачем это нужно: обычное обновление приложения через RuStore не удаляет данные —
// Android сохраняет их автоматически, если applicationId и подпись (keystore) не меняются.
// Но чтобы данные пользователя (профиль, документы с фото, оружие, автомобиль, события охоты)
// были защищены даже от непредвиденного сбоя основной базы (IndexedDB) при обновлении версии,
// приложение само, без каких-либо действий пользователя, ведёт технический снимок данных
// во внутреннем защищённом хранилище устройства и при следующем запуске автоматически
// подхватывает его обратно, если основная база вдруг окажется пустой.
//
// Это НЕ функция «Сохранить / Восстановить» из настроек — та делает файл для переноса
// данных на другой телефон вручную. Здесь всё происходит незаметно и автоматически.

import type { HunterDto, WeaponDto, HuntEventDto, MedicalCertificateDto, DocumentDto, CarDto } from '@/lib/api';
import { dbGetAll, dbPut } from '@/lib/local-db';
import { isNativeApp } from '@/lib/native';

const HUNTER_ID_KEY = 'hunter_diary_hunter_id';
const SNAPSHOT_FILE = 'hunter-diary-snapshot.json';
const SNAPSHOT_VERSION = 1;
const STORES = ['hunters', 'weapons', 'huntEvents', 'medicalCertificates', 'documents', 'cars'] as const;

interface SnapshotData {
  version: number;
  savedAt: string;
  activeHunterId: string | null;
  hunters: HunterDto[];
  weapons: WeaponDto[];
  huntEvents: HuntEventDto[];
  medicalCertificates: MedicalCertificateDto[];
  documents: DocumentDto[];
  cars: CarDto[];
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

const collectSnapshot = async (): Promise<SnapshotData> => {
  const [hunters, weapons, huntEvents, medicalCertificates, documents, cars] = await Promise.all([
    dbGetAll<HunterDto>('hunters'),
    dbGetAll<WeaponDto>('weapons'),
    dbGetAll<HuntEventDto>('huntEvents'),
    dbGetAll<MedicalCertificateDto>('medicalCertificates'),
    dbGetAll<DocumentDto>('documents'),
    dbGetAll<CarDto>('cars'),
  ]);
  return {
    version: SNAPSHOT_VERSION,
    savedAt: new Date().toISOString(),
    activeHunterId: localStorage.getItem(HUNTER_ID_KEY),
    hunters,
    weapons,
    huntEvents,
    medicalCertificates,
    documents,
    cars,
  };
};

export const saveSnapshotNow = async (): Promise<void> => {
  if (!isNativeApp) return;
  try {
    const snapshot = await collectSnapshot();
    if (snapshot.hunters.length === 0) return;
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    await Filesystem.writeFile({
      path: SNAPSHOT_FILE,
      directory: Directory.Data,
      data: JSON.stringify(snapshot),
      encoding: Encoding.UTF8,
    });
  } catch {
    /* сохранение технического снимка не критично для работы приложения */
  }
};

// Вызывается после каждого изменения данных. Собирает снимок с небольшой задержкой,
// чтобы не делать это на каждое нажатие клавиши, а одним снимком после серии правок.
export const scheduleSnapshot = (): void => {
  if (!isNativeApp) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveSnapshotNow();
  }, 1500);
};

// Вызывается один раз при старте приложения. Если основное хранилище (IndexedDB) пустое,
// а технический снимок существует — восстанавливает из него данные автоматически.
export const restoreFromSnapshotIfEmpty = async (): Promise<void> => {
  if (!isNativeApp) return;
  try {
    const existingHunters = await dbGetAll<HunterDto>('hunters');
    if (existingHunters.length > 0) return;

    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const file = await Filesystem.readFile({
      path: SNAPSHOT_FILE,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    const text = typeof file.data === 'string' ? file.data : await (file.data as Blob).text();
    const snapshot = JSON.parse(text) as SnapshotData;
    if (!snapshot || !Array.isArray(snapshot.hunters) || snapshot.hunters.length === 0) return;

    await Promise.all([
      ...snapshot.hunters.map((h) => dbPut('hunters', h)),
      ...(snapshot.weapons || []).map((w) => dbPut('weapons', w)),
      ...(snapshot.huntEvents || []).map((e) => dbPut('huntEvents', e)),
      ...(snapshot.medicalCertificates || []).map((c) => dbPut('medicalCertificates', c)),
      ...(snapshot.documents || []).map((d) => dbPut('documents', d)),
      ...(snapshot.cars || []).map((c) => dbPut('cars', c)),
    ]);

    if (!localStorage.getItem(HUNTER_ID_KEY)) {
      const restoredId = snapshot.activeHunterId || snapshot.hunters[0]?.id;
      if (restoredId) localStorage.setItem(HUNTER_ID_KEY, restoredId);
    }
  } catch {
    /* снимка ещё нет (первый запуск) либо файл не найден — это нормально */
  }
};

export { STORES as SNAPSHOT_STORES };
