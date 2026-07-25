import { useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';
import type { HuntEventDto } from '@/lib/api';

const MAP_URL = 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/e4fe8ddd-f3f2-40b1-b1dd-42130141e7fd.jpg';

interface Props {
  hunterId?: string;
  events: HuntEventDto[];
  loading: boolean;
}

const HuntMap = ({ hunterId, events = [], loading }: Props) => {
  const [active, setActive] = useState<HuntEventDto | null>(null);
  const points = events.filter((ev) => ev.mapX !== null && ev.mapY !== null);

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
              Точек пока нет — отметьте место на карте при добавлении события в календаре.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div
              className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-hero-surface"
              style={{ backgroundImage: `url(${MAP_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {points.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setActive(ev)}
                  className="absolute -translate-x-1/2 -translate-y-full text-primary transition-transform hover:scale-110"
                  style={{ left: `${ev.mapX}%`, top: `${ev.mapY}%` }}
                  aria-label={ev.title}
                >
                  <Icon
                    name="MapPin"
                    size={30}
                    className={`drop-shadow-[0_0_6px_rgba(217,154,63,0.8)] ${
                      active?.id === ev.id ? 'text-hero-accent' : ''
                    }`}
                    fill="currentColor"
                  />
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-hero-surface p-6 md:p-8">
              {active ? (
                <div>
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
                      Бюджет: <span className="font-medium text-hero-text">{active.budget.toLocaleString('ru')} ₽</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center text-sm text-hero-muted">
                  <Icon name="MousePointerClick" size={24} className="text-hero-muted" />
                  Нажмите на метку на карте, чтобы увидеть детали выезда.
                </div>
              )}

              <div className="mt-6 space-y-1.5 border-t border-border pt-4">
                {points.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setActive(ev)}
                    className={`flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors ${
                      active?.id === ev.id ? 'bg-primary/10 text-hero-text' : 'text-hero-muted hover:bg-secondary'
                    }`}
                  >
                    <Icon name="MapPin" size={13} className="shrink-0 text-primary" />
                    <span className="truncate">{ev.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HuntMap;
