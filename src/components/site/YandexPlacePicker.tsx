import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { loadYandexMaps, reverseGeocode, type GeocodeResult } from '@/lib/yandex-maps';

interface Props {
  address: string;
  lat: number | null;
  lng: number | null;
  onChange: (patch: { address?: string; lat?: number | null; lng?: number | null; region?: string }) => void;
}

const DEFAULT_CENTER: [number, number] = [61.698653, 99.505405]; // центр России
const DEFAULT_ZOOM = 3;

const YandexPlacePicker = ({ address, lat, lng, onChange }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadYandexMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;
        const ymaps = (window as any).ymaps;
        const center = lat !== null && lng !== null ? [lat, lng] : DEFAULT_CENTER;
        const zoom = lat !== null && lng !== null ? 12 : DEFAULT_ZOOM;
        const map = new ymaps.Map(mapRef.current, {
          center,
          zoom,
          controls: ['zoomControl'],
        });
        mapInstance.current = map;

        if (lat !== null && lng !== null) {
          const pm = new ymaps.Placemark([lat, lng], {}, { draggable: true, preset: 'islands#orangeDotIcon' });
          map.geoObjects.add(pm);
          placemarkRef.current = pm;
          pm.events.add('dragend', async () => {
            const coords = pm.geometry.getCoordinates();
            const geo = await reverseGeocode(coords[0], coords[1]);
            onChange({
              lat: coords[0],
              lng: coords[1],
              address: geo?.address,
              region: geo?.region,
            });
          });
        }

        map.events.add('click', async (e: any) => {
          const coords = e.get('coords');
          placeMarker(coords[0], coords[1]);
          const geo = await reverseGeocode(coords[0], coords[1]);
          onChange({
            lat: coords[0],
            lng: coords[1],
            address: geo?.address,
            region: geo?.region,
          });
        });

        setReady(true);
      })
      .catch(() => setLoadError(true));

    return () => {
      cancelled = true;
      mapInstance.current?.destroy?.();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeMarker = (newLat: number, newLng: number) => {
    const ymaps = (window as any).ymaps;
    const map = mapInstance.current;
    if (!map || !ymaps) return;
    if (placemarkRef.current) {
      placemarkRef.current.geometry.setCoordinates([newLat, newLng]);
    } else {
      const pm = new ymaps.Placemark([newLat, newLng], {}, { draggable: true, preset: 'islands#orangeDotIcon' });
      map.geoObjects.add(pm);
      placemarkRef.current = pm;
      pm.events.add('dragend', async () => {
        const coords = pm.geometry.getCoordinates();
        const geo = await reverseGeocode(coords[0], coords[1]);
        onChange({
          lat: coords[0],
          lng: coords[1],
          address: geo?.address,
          region: geo?.region,
        });
      });
    }
    map.setCenter([newLat, newLng], 13, { duration: 300 });
  };

  const handleAddressInput = (value: string) => {
    onChange({ address: value });
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!value.trim() || !ready) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      try {
        const ymaps = (window as any).ymaps;
        const res = await ymaps.suggest(value);
        setSuggestions(res.map((r: any) => r.displayName || r.value));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const pickSuggestion = async (value: string) => {
    setShowSuggestions(false);
    onChange({ address: value });
    try {
      const ymaps = (window as any).ymaps;
      const res = await ymaps.geocode(value, { results: 1 });
      const first = res.geoObjects.get(0);
      if (!first) return;
      const [pickedLat, pickedLng] = first.geometry.getCoordinates();
      placeMarker(pickedLat, pickedLng);
      const region =
        first.getAdministrativeAreas?.()?.[0] || first.getLocalities?.()?.[0] || first.getCountry?.() || '';
      onChange({ address: first.getAddressLine(), lat: pickedLat, lng: pickedLng, region });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={address}
          onChange={(e) => handleAddressInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Начните вводить адрес — точка появится на карте"
          className="border-border bg-hero-bg"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-sm border border-border bg-hero-surface shadow-lg">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => pickSuggestion(s)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-hero-text transition-colors hover:bg-secondary"
              >
                <Icon name="MapPin" size={13} className="shrink-0 text-primary" />
                <span className="truncate">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loadError ? (
        <div className="flex items-center gap-2 rounded-sm border border-dashed border-border bg-hero-bg px-4 py-3 text-sm text-hero-muted">
          <Icon name="TriangleAlert" size={16} /> Не удалось загрузить карту. Проверьте соединение.
        </div>
      ) : (
        <div ref={mapRef} className="h-72 w-full overflow-hidden rounded-sm border border-border" />
      )}

      {lat !== null && lng !== null && (
        <button
          type="button"
          onClick={() => {
            placemarkRef.current?.geometry && mapInstance.current?.geoObjects.remove(placemarkRef.current);
            placemarkRef.current = null;
            onChange({ lat: null, lng: null });
          }}
          className="text-xs text-hero-muted underline-offset-2 hover:text-hero-text hover:underline"
        >
          Сбросить точку
        </button>
      )}
    </div>
  );
};

export default YandexPlacePicker;
