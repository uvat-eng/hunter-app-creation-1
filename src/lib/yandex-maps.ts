export const YANDEX_MAPS_API_KEY = '123321dd-b170-4cdb-86f0-718a212ee231';

let loadPromise: Promise<void> | null = null;

export function loadYandexMaps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).ymaps?.Map) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('yandex-maps-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => (window as any).ymaps.ready(resolve));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'yandex-maps-script';
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => (window as any).ymaps.ready(resolve);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return loadPromise;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
  region: string;
}

function extractRegion(geoObject: any): string {
  try {
    const areas = geoObject.getAdministrativeAreas?.() || [];
    if (areas[0]) return areas[0];
    const localities = geoObject.getLocalities?.() || [];
    if (localities[0]) return localities[0];
    return geoObject.getCountry?.() || '';
  } catch {
    return '';
  }
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;
  await loadYandexMaps();
  const ymaps = (window as any).ymaps;
  const res = await ymaps.geocode(query, { results: 1 });
  const first = res.geoObjects.get(0);
  if (!first) return null;
  const [lat, lng] = first.geometry.getCoordinates();
  const address = first.getAddressLine();
  return { lat, lng, address, region: extractRegion(first) };
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  await loadYandexMaps();
  const ymaps = (window as any).ymaps;
  const res = await ymaps.geocode([lat, lng], { results: 1 });
  const first = res.geoObjects.get(0);
  if (!first) return null;
  const address = first.getAddressLine();
  return { lat, lng, address, region: extractRegion(first) };
}