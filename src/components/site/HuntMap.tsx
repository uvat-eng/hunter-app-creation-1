import { useMemo, useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';
import type { HuntEventDto } from '@/lib/api';
import {
  ALL_MAPS,
  RUSSIA_OVERVIEW,
  RUSSIA_MAP_IMAGE,
  geoToViewportPercent,
  boundsToBackgroundStyle,
  findDistrictForPoint,
  type RegionMap,
} from '@/lib/russia-maps';
import WeatherWidget from './WeatherWidget';

interface Props {
  hunterId?: string;
  events: HuntEventDto[];
  loading: boolean;
}

const fmtMoney = (n: number) => `${n.toLocaleString('ru')} ₽`;

const HuntMap = ({ hunterId, events = [], loading }: Props) => {
  const points = useMemo(() => events.filter((ev) => ev.lat !== null && ev.lng !== null), [events]);

  const defaultMapKey = useMemo(() => {
    if (points.length === 0) return RUSSIA_OVERVIEW.key;
    const first = points[0];
    const district = findDistrictForPoint(first.lat as number, first.lng as number);
    return district?.key || RUSSIA_OVERVIEW.key;
  }, [points]);

  const [mapKey, setMapKey] = useState(defaultMapKey);
  const [active, setActive] = useState<HuntEventDto | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const currentMap: RegionMap = ALL_MAPS.find((m) => m.key === mapKey) || RUSSIA_OVERVIEW;

  const bgStyle = useMemo(() => boundsToBackgroundStyle(currentMap.bounds), [currentMap]);

  const mapPoints = useMemo(() => {
    return points
      .map((ev) => {
        const pos = geoToViewportPercent(ev.lat as number, ev.lng as number, currentMap.bounds);
        return pos ? { ev, pos } : null;
      })
      .filter((v): v is { ev: HuntEventDto; pos: { x: number; y: number } } => v !== null);
  }, [points, currentMap]);

  const cityMarkers = useMemo(() => {
    return currentMap.cities
      .map((c) => {
        const pos = geoToViewportPercent(c.lat, c.lng, currentMap.bounds);
        return pos ? { city: c, pos } : null;
      })
      .filter((v): v is { city: { name: string; lat: number; lng: number }; pos: { x: number; y: number } } => v !== null);
  }, [currentMap]);

  const regionStats = useMemo(() => {
    const map = new Map<string, { count: number; budget: number }>();
    events.forEach((ev) => {
      const key = ev.region?.trim() || 'Без региона';
      const cur = map.get(key) || { count: 0, budget: 0 };
      cur.count += 1;
      cur.budget += ev.budget || 0;
      map.set(key, cur);
    });
    return [...map.entries()]
      .map(([region, v]) => ({ region, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  return (
    <section id="map" className="border-t border-border bg-hero-bg py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Мои угодья"
          title="Карта охот"
          description="Выберите карту России или федерального округа — точки выездов отмечены относительно крупных городов-ориентиров."
        />

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-hero-surface px-6 py-16 text-hero-muted">
            <Icon name="Loader2" size={20} className="animate-spin" /> Загружаем карту…
          </div>
        ) : !hunterId ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-hero-surface px-6 py-16 text-center">
            <Icon name="MapPinned" size={26} className="text-hero-muted" />
            <p className="text-sm text-hero-muted">Заведите карточку охотника, чтобы отмечать точки выездов.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {ALL_MAPS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMapKey(m.key);
                      setActive(null);
                    }}
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
                className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-hero-surface"
                style={{
                  backgroundImage: `url(${RUSSIA_MAP_IMAGE})`,
                  backgroundSize: `${bgStyle.sizePercent}%`,
                  backgroundPosition: `${bgStyle.posXPercent}% ${bgStyle.posYPercent}%`,
                  backgroundRepeat: 'no-repeat',
                  transition: 'background-size 0.4s ease, background-position 0.4s ease',
                }}
              >
                {cityMarkers.map(({ city, pos }) => (
                  <div
                    key={city.name}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <span className="block h-1.5 w-1.5 rounded-full bg-hero-muted/70 ring-2 ring-hero-bg/40" />
                    <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap text-[10px] text-hero-muted/80">
                      {city.name}
                    </span>
                  </div>
                ))}

                {mapPoints.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-hero-bg/40 px-6 text-center text-sm text-hero-muted">
                    На этой карте пока нет точек — выберите другой округ или добавьте адрес охоты в календаре.
                  </div>
                ) : (
                  mapPoints.map(({ ev, pos }) => (
                    <button
                      key={ev.id}
                      onClick={() => setActive(ev)}
                      className="absolute -translate-x-1/2 -translate-y-full text-primary transition-transform hover:scale-110"
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      aria-label={ev.title}
                    >
                      <Icon
                        name="MapPin"
                        size={28}
                        className={`drop-shadow-[0_0_6px_rgba(217,154,63,0.8)] ${
                          active?.id === ev.id ? 'text-hero-accent' : ''
                        }`}
                        fill="currentColor"
                      />
                    </button>
                  ))
                )}
              </div>

              <div className="flex items-center gap-5 text-xs text-hero-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="MapPin" size={13} className="text-primary" fill="currentColor" /> точка выезда
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-hero-muted/70" /> город-ориентир
                </span>
              </div>

              {active && (
                <div className="rounded-lg border border-border bg-hero-surface p-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${active.status === 'planned' ? 'bg-primary' : 'bg-hero-muted'}`}
                    />
                    <span className="text-xs uppercase tracking-wide text-hero-muted">
                      {active.status === 'planned' ? 'Запланировано' : 'Состоялось'} · {active.huntType}
                    </span>
                  </div>
                  <div className="mt-1 font-head text-xl font-semibold text-hero-text">{active.title}</div>
                  <div className="mt-1 text-sm text-hero-muted">
                    {new Date(active.date).toLocaleDateString('ru')}
                    {active.locationName ? ` · ${active.locationName}` : ''}
                  </div>
                  {active.trophies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {active.trophies.map((t, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-hero-muted"
                        >
                          <Icon name="Award" size={11} className="text-primary" />
                          {t.game} × {t.count}
                        </span>
                      ))}
                    </div>
                  )}
                  {active.budget ? (
                    <div className="mt-3 text-sm text-hero-muted">
                      Бюджет: <span className="font-medium text-hero-text">{fmtMoney(active.budget)}</span>
                    </div>
                  ) : null}
                  {active.status === 'planned' && active.lat !== null && active.lng !== null && (
                    <WeatherWidget lat={active.lat} lng={active.lng} date={active.date} className="mt-4" />
                  )}
                </div>
              )}
            </div>

            {/* экспликация по регионам */}
            <div className="rounded-lg border border-border bg-hero-surface p-6 md:p-8">
              <div className="font-head text-lg font-semibold uppercase tracking-wide text-hero-text">
                Экспликация по регионам
              </div>
              <p className="mt-1 text-xs text-hero-muted">Количество выездов и бюджет по каждому региону</p>

              {regionStats.length === 0 ? (
                <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center text-sm text-hero-muted">
                  <Icon name="MapPinned" size={22} className="text-hero-muted" />
                  Точек пока нет — укажите адрес охоты при добавлении события в календаре.
                </div>
              ) : (
                <div className="mt-5 space-y-2">
                  {regionStats.map((r) => (
                    <div
                      key={r.region}
                      onMouseEnter={() => setActiveRegion(r.region)}
                      onMouseLeave={() => setActiveRegion(null)}
                      className={`flex items-center justify-between gap-3 rounded-sm border px-3.5 py-3 transition-colors ${
                        activeRegion === r.region ? 'border-primary bg-primary/10' : 'border-border bg-hero-bg'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-hero-text">{r.region}</div>
                        <div className="text-xs text-hero-muted">
                          {r.count} {r.count === 1 ? 'выезд' : r.count < 5 ? 'выезда' : 'выездов'}
                        </div>
                      </div>
                      <div className="shrink-0 font-head text-base font-bold text-primary">
                        {r.budget > 0 ? fmtMoney(r.budget) : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="text-hero-muted">Всего регионов</span>
                <span className="font-head text-lg font-bold text-hero-text">{regionStats.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HuntMap;