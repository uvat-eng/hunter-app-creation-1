export interface MapBounds {
  // географические границы, которые соответствуют краям картинки (0-100%)
  north: number;
  south: number;
  west: number;
  east: number;
}

export interface CityRef {
  name: string;
  lat: number;
  lng: number;
}

export interface RegionMap {
  key: string;
  label: string;
  bounds: MapBounds;
  cities: CityRef[];
}

const CDN = 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files';

// единственное изображение — стилизованная карта России; все "региональные" карты
// являются лишь разными зонами (bounds) на этой же картинке, отображаемыми через zoom.
export const RUSSIA_MAP_IMAGE = `${CDN}/d03b62c5-e9c0-4def-9734-ca65f2d319f6.jpg`;

// границы откалиброваны по видимому контуру сгенерированной карты (есть технологические отступы)
export const FULL_BOUNDS: MapBounds = { north: 103.7, south: 23.3, west: 2.8, east: 205.2 };

export const RUSSIA_OVERVIEW: RegionMap = {
  key: 'russia',
  label: 'Вся Россия',
  bounds: FULL_BOUNDS,
  cities: [
    { name: 'Москва', lat: 55.75, lng: 37.62 },
    { name: 'Санкт-Петербург', lat: 59.94, lng: 30.31 },
    { name: 'Екатеринбург', lat: 56.84, lng: 60.61 },
    { name: 'Новосибирск', lat: 55.03, lng: 82.92 },
    { name: 'Красноярск', lat: 56.01, lng: 92.87 },
    { name: 'Иркутск', lat: 52.29, lng: 104.30 },
    { name: 'Владивосток', lat: 43.12, lng: 131.89 },
    { name: 'Якутск', lat: 62.03, lng: 129.73 },
    { name: 'Краснодар', lat: 45.04, lng: 38.98 },
    { name: 'Казань', lat: 55.80, lng: 49.11 },
    { name: 'Тюмень', lat: 57.15, lng: 65.53 },
    { name: 'Мурманск', lat: 68.97, lng: 33.09 },
    { name: 'Петропавловск-Камчатский', lat: 53.02, lng: 158.65 },
  ],
};

export const FEDERAL_DISTRICTS: RegionMap[] = [
  {
    key: 'central',
    label: 'Центральный ФО',
    bounds: { north: 60, south: 49, west: 27, east: 43 },
    cities: [
      { name: 'Москва', lat: 55.75, lng: 37.62 },
      { name: 'Воронеж', lat: 51.66, lng: 39.20 },
      { name: 'Ярославль', lat: 57.63, lng: 39.87 },
      { name: 'Тула', lat: 54.19, lng: 37.62 },
      { name: 'Смоленск', lat: 54.78, lng: 32.05 },
      { name: 'Курск', lat: 51.73, lng: 36.19 },
    ],
  },
  {
    key: 'northwest',
    label: 'Северо-Западный ФО',
    bounds: { north: 82, south: 55, west: 17, east: 67 },
    cities: [
      { name: 'Санкт-Петербург', lat: 59.94, lng: 30.31 },
      { name: 'Мурманск', lat: 68.97, lng: 33.09 },
      { name: 'Архангельск', lat: 64.54, lng: 40.54 },
      { name: 'Калининград', lat: 54.71, lng: 20.51 },
      { name: 'Вологда', lat: 59.22, lng: 39.89 },
      { name: 'Сыктывкар', lat: 61.67, lng: 50.84 },
    ],
  },
  {
    key: 'south',
    label: 'Южный ФО',
    bounds: { north: 51, south: 43, west: 35, east: 50 },
    cities: [
      { name: 'Ростов-на-Дону', lat: 47.23, lng: 39.72 },
      { name: 'Краснодар', lat: 45.04, lng: 38.98 },
      { name: 'Волгоград', lat: 48.71, lng: 44.50 },
      { name: 'Симферополь', lat: 44.95, lng: 34.10 },
      { name: 'Астрахань', lat: 46.35, lng: 48.04 },
      { name: 'Сочи', lat: 43.60, lng: 39.73 },
    ],
  },
  {
    key: 'ncaucasus',
    label: 'Северо-Кавказский ФО',
    bounds: { north: 47, south: 40, west: 39.5, east: 49.5 },
    cities: [
      { name: 'Ставрополь', lat: 45.04, lng: 41.97 },
      { name: 'Грозный', lat: 43.32, lng: 45.70 },
      { name: 'Махачкала', lat: 42.98, lng: 47.50 },
      { name: 'Владикавказ', lat: 43.02, lng: 44.68 },
      { name: 'Нальчик', lat: 43.50, lng: 43.61 },
    ],
  },
  {
    key: 'volga',
    label: 'Приволжский ФО',
    bounds: { north: 62, south: 49.5, west: 40, east: 63 },
    cities: [
      { name: 'Казань', lat: 55.80, lng: 49.11 },
      { name: 'Нижний Новгород', lat: 56.33, lng: 44.00 },
      { name: 'Самара', lat: 53.20, lng: 50.15 },
      { name: 'Уфа', lat: 54.74, lng: 55.97 },
      { name: 'Пермь', lat: 58.01, lng: 56.23 },
      { name: 'Саратов', lat: 51.53, lng: 46.03 },
    ],
  },
  {
    key: 'ural',
    label: 'Уральский ФО',
    bounds: { north: 74, south: 50, west: 57, east: 79 },
    cities: [
      { name: 'Екатеринбург', lat: 56.84, lng: 60.61 },
      { name: 'Тюмень', lat: 57.15, lng: 65.53 },
      { name: 'Челябинск', lat: 55.16, lng: 61.40 },
      { name: 'Ханты-Мансийск', lat: 61.00, lng: 69.00 },
      { name: 'Курган', lat: 55.44, lng: 65.34 },
      { name: 'Салехард', lat: 66.53, lng: 66.60 },
    ],
  },
  {
    key: 'siberia',
    label: 'Сибирский ФО',
    bounds: { north: 80, south: 48, west: 73, east: 121 },
    cities: [
      { name: 'Новосибирск', lat: 55.03, lng: 82.92 },
      { name: 'Красноярск', lat: 56.01, lng: 92.87 },
      { name: 'Иркутск', lat: 52.29, lng: 104.30 },
      { name: 'Омск', lat: 54.99, lng: 73.37 },
      { name: 'Барнаул', lat: 53.35, lng: 83.78 },
      { name: 'Кемерово', lat: 55.35, lng: 86.09 },
    ],
  },
  {
    key: 'fareast',
    label: 'Дальневосточный ФО',
    bounds: { north: 78, south: 41, west: 111, east: 191 },
    cities: [
      { name: 'Владивосток', lat: 43.12, lng: 131.89 },
      { name: 'Хабаровск', lat: 48.48, lng: 135.08 },
      { name: 'Якутск', lat: 62.03, lng: 129.73 },
      { name: 'Петропавловск-Камчатский', lat: 53.02, lng: 158.65 },
      { name: 'Южно-Сахалинск', lat: 46.96, lng: 142.74 },
      { name: 'Благовещенск', lat: 50.29, lng: 127.54 },
    ],
  },
];

export const ALL_MAPS: RegionMap[] = [RUSSIA_OVERVIEW, ...FEDERAL_DISTRICTS];

// переводит lat/lng в проценты x/y (0-100) относительно ПОЛНОЙ карты (для расчёта background-position)
export function geoToFullPercent(lat: number, lng: number): { x: number; y: number } {
  let normalizedLng = lng;
  if (normalizedLng < FULL_BOUNDS.west) normalizedLng += 360;
  const x = ((normalizedLng - FULL_BOUNDS.west) / (FULL_BOUNDS.east - FULL_BOUNDS.west)) * 100;
  const y = ((FULL_BOUNDS.north - lat) / (FULL_BOUNDS.north - FULL_BOUNDS.south)) * 100;
  return { x, y };
}

// проверяет попадание точки в bounds региона
export function isInBounds(lat: number, lng: number, bounds: MapBounds): boolean {
  let normalizedLng = lng;
  if (normalizedLng < bounds.west - 180) normalizedLng += 360;
  return lat <= bounds.north && lat >= bounds.south && normalizedLng >= bounds.west && normalizedLng <= bounds.east;
}

// вычисляет параметры CSS zoom (background-size % и background-position %) для показа bounds региона
// как если бы это была отдельная карта, вырезанная из полной картинки.
// Считает в процентах ПОЛНОЙ картинки (а не в градусах), чтобы верно учесть непропорциональность проекции.
export function boundsToBackgroundStyle(bounds: MapBounds): { sizePercent: number; posXPercent: number; posYPercent: number } {
  const topLeft = geoToFullPercent(bounds.north, bounds.west);
  const bottomRight = geoToFullPercent(bounds.south, bounds.east);
  const regionWPct = bottomRight.x - topLeft.x;
  const regionHPct = bottomRight.y - topLeft.y;

  // letterbox: меньший масштаб, чтобы регион ПОЛНОСТЬЮ поместился во вьюпорт без обрезки
  const scale = 100 / Math.max(regionWPct, regionHPct);
  const sizePercent = scale * 100;

  const centerPct = { x: (topLeft.x + bottomRight.x) / 2, y: (topLeft.y + bottomRight.y) / 2 };
  const posXPercent = (50 - centerPct.x * scale) / (1 - scale);
  const posYPercent = (50 - centerPct.y * scale) / (1 - scale);

  return {
    sizePercent,
    posXPercent: Number.isFinite(posXPercent) ? Math.min(100, Math.max(0, posXPercent)) : 50,
    posYPercent: Number.isFinite(posYPercent) ? Math.min(100, Math.max(0, posYPercent)) : 50,
  };
}

// переводит lat/lng в проценты x/y (0-100) ВНУТРИ вьюпорта конкретной карты (для позиционирования булавок)
export function geoToViewportPercent(lat: number, lng: number, bounds: MapBounds): { x: number; y: number } | null {
  if (!isInBounds(lat, lng, bounds)) return null;
  let normalizedLng = lng;
  if (normalizedLng < bounds.west - 180) normalizedLng += 360;
  const x = ((normalizedLng - bounds.west) / (bounds.east - bounds.west)) * 100;
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 100;
  if (x < 0 || x > 100 || y < 0 || y > 100) return null;
  return { x, y };
}

// определяет, к какому округу относится точка (по first-match — приблизительно, без точных границ)
export function findDistrictForPoint(lat: number, lng: number): RegionMap | null {
  for (const d of FEDERAL_DISTRICTS) {
    if (isInBounds(lat, lng, d.bounds)) return d;
  }
  return null;
}

// обратное преобразование: проценты x/y (0-100) внутри вьюпорта карты → географические координаты
// (используется, когда пользователь ставит точку кликом по карте)
export function viewportPercentToGeo(x: number, y: number, bounds: MapBounds): { lat: number; lng: number } {
  let lng = bounds.west + (x / 100) * (bounds.east - bounds.west);
  if (lng > 180) lng -= 360;
  const lat = bounds.north - (y / 100) * (bounds.north - bounds.south);
  return { lat, lng };
}