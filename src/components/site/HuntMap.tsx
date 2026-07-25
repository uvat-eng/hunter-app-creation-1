import { useEffect, useMemo, useRef, useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';
import type { HuntEventDto } from '@/lib/api';
import { loadYandexMaps } from '@/lib/yandex-maps';

interface Props {
  hunterId?: string;
  events: HuntEventDto[];
  loading: boolean;
}

const fmtMoney = (n: number) => `${n.toLocaleString('ru')} ₽`;

const HuntMap = ({ hunterId, events = [], loading }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [active, setActive] = useState<HuntEventDto | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const points = useMemo(() => events.filter((ev) => ev.lat !== null && ev.lng !== null), [events]);

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

  useEffect(() => {
    if (!hunterId || points.length === 0) return;
    let cancelled = false;
    loadYandexMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;
        const ymaps = (window as any).ymaps;
        const map = new ymaps.Map(mapRef.current, {
          center: [points[0].lat, points[0].lng],
          zoom: 5,
          controls: ['zoomControl'],
        });
        mapInstance.current = map;

        points.forEach((ev) => {
          const pm = new ymaps.Placemark(
            [ev.lat, ev.lng],
            { balloonContent: ev.title },
            { preset: ev.status === 'done' ? 'islands#grayDotIcon' : 'islands#orangeDotIcon' },
          );
          pm.events.add('click', () => setActive(ev));
          map.geoObjects.add(pm);
        });

        if (points.length > 1) {
          map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true, zoomMargin: 40 });
        }
      })
      .catch(() => setMapError(true));

    return () => {
      cancelled = true;
      mapInstance.current?.destroy?.();
      mapInstance.current = null;
    };
  }, [hunterId, points]);

  return (
    <section id="map" className="border-t border-border bg-hero-bg py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Мои угодья"
          title="Карта охот"
          description="Все точки, отмеченные в календаре, собраны здесь — нажмите на метку, чтобы посмотреть детали выезда."
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
        ) : points.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-hero-surface px-6 py-16 text-center">
            <Icon name="MapPinned" size={26} className="text-hero-muted" />
            <p className="text-sm text-hero-muted">
              Точек пока нет — укажите адрес охоты при добавлении события в календаре.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              {mapError ? (
                <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-hero-surface p-6 text-center text-sm text-hero-muted">
                  <Icon name="TriangleAlert" size={18} className="mr-2" /> Не удалось загрузить карту
                </div>
              ) : (
                <div ref={mapRef} className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-hero-surface" />
              )}

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
                </div>
              )}
            </div>

            {/* экспликация по регионам */}
            <div className="rounded-lg border border-border bg-hero-surface p-6 md:p-8">
              <div className="font-head text-lg font-semibold uppercase tracking-wide text-hero-text">
                Экспликация по регионам
              </div>
              <p className="mt-1 text-xs text-hero-muted">Количество выездов и бюджет по каждому региону</p>

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