import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  ALL_MAPS,
  RUSSIA_OVERVIEW,
  RUSSIA_MAP_IMAGE,
  boundsToBackgroundStyle,
  geoToViewportPercent,
  viewportPercentToGeo,
  findDistrictForPoint,
  type RegionMap,
} from '@/lib/russia-maps';

interface Props {
  address: string;
  lat: number | null;
  lng: number | null;
  onChange: (patch: { address?: string; lat?: number | null; lng?: number | null; region?: string }) => void;
}

const HuntPlacePicker = ({ address, lat, lng, onChange }: Props) => {
  const initialMapKey = useMemo(() => {
    if (lat === null || lng === null) return RUSSIA_OVERVIEW.key;
    return findDistrictForPoint(lat, lng)?.key || RUSSIA_OVERVIEW.key;
  }, [lat, lng]);

  const [mapKey, setMapKey] = useState(initialMapKey);
  const currentMap: RegionMap = ALL_MAPS.find((m) => m.key === mapKey) || RUSSIA_OVERVIEW;
  const bgStyle = useMemo(() => boundsToBackgroundStyle(currentMap.bounds), [currentMap]);

  const markerPos = useMemo(() => {
    if (lat === null || lng === null) return null;
    return geoToViewportPercent(lat, lng, currentMap.bounds);
  }, [lat, lng, currentMap]);

  const cityMarkers = useMemo(() => currentMap.cities, [currentMap]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const geo = viewportPercentToGeo(x, y, currentMap.bounds);
    const district = findDistrictForPoint(geo.lat, geo.lng);
    onChange({ lat: geo.lat, lng: geo.lng, region: district?.label || currentMap.label });
  };

  return (
    <div className="space-y-3">
      <div>
        <Input
          value={address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Название места (озеро, урочище, деревня…)"
          className="border-border bg-hero-bg"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ALL_MAPS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMapKey(m.key)}
            className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
              mapKey === m.key
                ? 'border-primary bg-primary/10 text-hero-text'
                : 'border-border text-hero-muted hover:border-primary/50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div
        onClick={handleMapClick}
        className="relative aspect-square w-full cursor-crosshair overflow-hidden rounded-sm border border-border bg-hero-surface"
        style={{
          backgroundImage: `url(${RUSSIA_MAP_IMAGE})`,
          backgroundSize: `${bgStyle.sizePercent}%`,
          backgroundPosition: `${bgStyle.posXPercent}% ${bgStyle.posYPercent}%`,
          backgroundRepeat: 'no-repeat',
          transition: 'background-size 0.4s ease, background-position 0.4s ease',
        }}
      >
        {cityMarkers.map((c) => {
          const pos = geoToViewportPercent(c.lat, c.lng, currentMap.bounds);
          if (!pos) return null;
          return (
            <div
              key={c.name}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span className="block h-1.5 w-1.5 rounded-full bg-hero-muted/70 ring-2 ring-hero-bg/40" />
              <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap text-[10px] text-hero-muted/80">
                {c.name}
              </span>
            </div>
          );
        })}

        {markerPos && (
          <span
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full text-primary"
            style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%` }}
          >
            <Icon name="MapPin" size={30} className="drop-shadow-[0_0_6px_rgba(217,154,63,0.8)]" fill="currentColor" />
          </span>
        )}

        {!markerPos && (
          <div className="absolute inset-0 flex items-center justify-center bg-hero-bg/30 px-6 text-center text-xs text-hero-muted">
            Кликните по карте, чтобы отметить место охоты
          </div>
        )}
      </div>

      {lat !== null && lng !== null && (
        <button
          type="button"
          onClick={() => onChange({ lat: null, lng: null, region: '' })}
          className="text-xs text-hero-muted underline-offset-2 hover:text-hero-text hover:underline"
        >
          Сбросить точку
        </button>
      )}
    </div>
  );
};

export default HuntPlacePicker;
