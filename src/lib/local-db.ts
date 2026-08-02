// Локальное хранилище приложения на устройстве (IndexedDB).
// Все данные пользователя (профиль, оружие, события, справки — включая фото и видео)
// хранятся только на телефоне и никуда не передаются.

const DB_NAME = 'hunter-diary-db';
const DB_VERSION = 1;
const STORES = ['hunters', 'weapons', 'huntEvents', 'medicalCertificates'] as const;
type StoreName = (typeof STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB недоступен в этом браузере'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Не удалось открыть локальную базу данных'));
  }).catch((err) => {
    dbPromise = null;
    throw err;
  });
  return dbPromise;
};

const withStore = <T>(
  store: StoreName,
  mode: IDBTransactionMode,
  fn: (os: IDBObjectStore) => IDBRequest<T>,
): Promise<T> =>
  openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const os = tx.objectStore(store);
        const req = fn(os);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error(`Ошибка операции с хранилищем "${store}"`));
        tx.onerror = () => reject(tx.error || new Error(`Ошибка транзакции в хранилище "${store}"`));
        tx.onabort = () => reject(tx.error || new Error(`Транзакция в хранилище "${store}" прервана`));
      }),
  );

export const genId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const dbGet = <T>(store: StoreName, id: string): Promise<T | undefined> =>
  withStore<T>(store, 'readonly', (os) => os.get(id));

export const dbGetAll = <T>(store: StoreName): Promise<T[]> =>
  withStore<T[]>(store, 'readonly', (os) => os.getAll());

export const dbPut = <T>(store: StoreName, value: T): Promise<T> =>
  withStore(store, 'readwrite', (os) => os.put(value)).then(() => value);

export const dbDelete = (store: StoreName, id: string): Promise<void> =>
  withStore(store, 'readwrite', (os) => os.delete(id)).then(() => undefined);