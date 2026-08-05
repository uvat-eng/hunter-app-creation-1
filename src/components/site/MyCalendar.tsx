import { useMemo, useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import type { HuntEventDto } from '@/lib/api';
import { addToDeviceCalendar } from '@/lib/device-calendar';
import { SPECIES, matchSpecies } from '@/lib/hunt-species';
import HuntEventEditor from './HuntEventEditor';
import HuntEventViewer from './HuntEventViewer';
import WeatherBadge from './WeatherBadge';
import { getMoonPhase } from '@/lib/moon';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const months = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

interface Props {
  hunterId?: string;
  events: HuntEventDto[];
  loading: boolean;
  onUpsert: (saved: HuntEventDto) => void;
  onRemove: (id: string) => void;
}

const MyCalendar = ({ hunterId, events = [], loading, onUpsert, onRemove }: Props) => {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<HuntEventDto | null>(null);
  const [initialDate, setInitialDate] = useState<string | undefined>(undefined);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewEvent, setViewEvent] = useState<HuntEventDto | null>(null);

  const days = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const start = (first.getDay() + 6) % 7;
    const total = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (number | null)[] = Array(start).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [view]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, HuntEventDto[]>();
    events.forEach((ev) => {
      const d = new Date(ev.date);
      if (d.getFullYear() === view.y && d.getMonth() === view.m) {
        const day = d.getDate();
        map.set(day, [...(map.get(day) || []), ev]);
      }
    });
    return map;
  }, [events, view]);

  const shift = (dir: number) => {
    setView((v) => {
      const m = v.m + dir;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { ...v, m };
    });
  };

  const openAdd = (dateStr?: string) => {
    if (!hunterId) {
      toast({ title: 'Сначала заведите карточку охотника', description: 'Заполните анкету, чтобы вести дневник охот.' });
      return;
    }
    setEditEvent(null);
    setInitialDate(dateStr);
    setOpen(true);
  };

  const openEdit = (ev: HuntEventDto) => {
    setViewOpen(false);
    setEditEvent(ev);
    setInitialDate(undefined);
    setOpen(true);
  };

  const openView = (ev: HuntEventDto) => {
    setViewEvent(ev);
    setViewOpen(true);
  };

  const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1));

  const bag = useMemo(() => {
    const counts = new Map<string, number>();
    events
      .filter((ev) => ev.status === 'done')
      .forEach((ev) => {
        ev.trophies.forEach((t) => {
          if (!t.game.trim()) return;
          const key = matchSpecies(t.game);
          const n = parseInt(t.count, 10) || 1;
          counts.set(key, (counts.get(key) || 0) + n);
        });
      });
    return counts;
  }, [events]);

  const totalBudget = useMemo(
    () => events.reduce((sum, ev) => sum + (ev.budget || 0), 0),
    [events],
  );

  return (
    <section id="calendar" className="border-t border-border bg-hero-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Личный дневник охотника"
          title="Календарь выездов"
          description="Отмечайте планируемые и завершённые охоты, добавляйте трофеи и точку на карте — события можно перенести в календарь телефона с напоминанием. Все события автоматически попадают в дневник выездов ниже."
        />

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* календарь */}
          <div className="rounded-lg border border-border bg-hero-bg p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-head text-xl font-semibold text-hero-text">
                {months[view.m]} {view.y}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => shift(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-hero-text"
                >
                  <Icon name="ChevronLeft" size={18} />
                </button>
                <button
                  onClick={() => shift(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-hero-text"
                >
                  <Icon name="ChevronRight" size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {weekdays.map((w) => (
                <div key={w} className="pb-2 text-center text-xs uppercase tracking-wide text-hero-muted">
                  {w}
                </div>
              ))}
              {days.map((d, i) => {
                if (d === null) return <div key={i} />;
                const dayEvents = eventsByDay.get(d) || [];
                const hasPlanned = dayEvents.some((e) => e.status === 'planned');
                const hasDone = dayEvents.some((e) => e.status === 'done');
                const dateStr = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const moonPhase = getMoonPhase(dateStr).phaseIndex;
                const isFullMoon = moonPhase === 4;
                const isNewMoon = moonPhase === 0;
                return (
                  <button
                    key={i}
                    onClick={() => (dayEvents.length ? openView(dayEvents[0]) : openAdd(dateStr))}
                    title={isFullMoon ? 'Полнолуние' : isNewMoon ? 'Новолуние' : undefined}
                    className={`relative aspect-square rounded-sm text-sm font-medium transition-all ${
                      dayEvents.length
                        ? 'bg-primary/15 text-hero-text hover:bg-primary/25'
                        : 'text-hero-text hover:bg-primary/10'
                    }`}
                  >
                    {d}
                    {(isFullMoon || isNewMoon) && (
                      <Icon
                        name="Moon"
                        size={11}
                        className={`absolute right-1 top-1 ${isFullMoon ? 'text-primary' : 'text-hero-muted'}`}
                      />
                    )}
                    {dayEvents.length > 0 && (
                      <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                        {hasPlanned && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        {hasDone && <span className="h-1.5 w-1.5 rounded-full bg-hero-muted" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-xs text-hero-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> запланировано
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-hero-muted" /> состоялось
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="Moon" size={13} className="text-primary" /> полнолуние / новолуние
              </span>
            </div>

            <button
              onClick={() => openAdd()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Icon name="Plus" size={18} /> Добавить событие
            </button>
          </div>

          {/* таблица добычи по видам */}
          <div className="flex flex-col rounded-lg border border-border bg-hero-bg p-6 md:p-8">
            <div className="font-head text-lg font-semibold uppercase tracking-wide text-hero-text">Добыто</div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {SPECIES.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between gap-2 rounded-sm border border-border bg-hero-surface px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-8 w-8 shrink-0 rounded-sm border border-border bg-hero-bg bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${s.icon})` }}
                    />
                    <span className="truncate text-sm text-hero-text">{s.label}</span>
                  </span>
                  <span className="shrink-0 font-head text-lg font-bold text-primary">{bag.get(s.key) || 0}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-sm border border-border bg-hero-surface px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-hero-muted">Общий бюджет охот</div>
              <div className="mt-1 font-head text-2xl font-bold text-primary">
                {totalBudget.toLocaleString('ru')} ₽
              </div>
            </div>
          </div>
        </div>

        {/* список событий */}
        <div className="mt-6 rounded-lg border border-border bg-hero-bg p-6 md:p-8">
          <div className="font-head text-lg font-semibold text-hero-text">Мои события</div>

          {loading ? (
            <div className="mt-6 flex items-center justify-center gap-2 py-10 text-hero-muted">
              <Icon name="Loader2" size={18} className="animate-spin" /> Загружаем…
            </div>
          ) : !hunterId ? (
            <div className="mt-6 flex flex-col items-center gap-2 py-10 text-center text-sm text-hero-muted">
              <Icon name="CalendarOff" size={26} className="text-hero-muted" />
              Заведите карточку охотника, чтобы вести дневник охот.
            </div>
          ) : sorted.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 py-10 text-center text-sm text-hero-muted">
              <Icon name="CalendarPlus" size={26} className="text-hero-muted" />
              Событий пока нет — добавьте первую охоту.
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sorted.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => openView(ev)}
                  className="group cursor-pointer rounded-sm border border-border bg-hero-surface p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${ev.status === 'planned' ? 'bg-primary' : 'bg-hero-muted'}`}
                        />
                        <span className="text-xs uppercase tracking-wide text-hero-muted">
                          {ev.status === 'planned' ? 'Запланировано' : 'Состоялось'} · {ev.huntType}
                        </span>
                      </div>
                      <div className="mt-1 font-head text-lg font-semibold text-hero-text">{ev.title}</div>
                      <div className="text-sm text-hero-muted">
                        {new Date(ev.date).toLocaleDateString('ru')}
                        {ev.locationName ? ` · ${ev.locationName}` : ''}
                      </div>
                      {ev.status === 'planned' && (
                        <WeatherBadge lat={ev.lat} lng={ev.lng} date={ev.date} className="mt-1.5" />
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const added = await addToDeviceCalendar({
                            title: ev.title,
                            date: ev.date,
                            description: [ev.huntType, ev.notes].filter(Boolean).join(' · '),
                            location: ev.locationName,
                            reminderMinutesBefore: 12 * 60,
                          });
                          toast(
                            added
                              ? { title: 'Событие добавлено в календарь телефона' }
                              : { title: 'Файл события скачан', description: 'Откройте его, чтобы добавить в календарь телефона.' },
                          );
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
                        aria-label="В календарь телефона"
                      >
                        <Icon name="CalendarPlus" size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(ev);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
                        aria-label="Редактировать"
                      >
                        <Icon name="Pencil" size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(ev.id);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-destructive hover:text-destructive"
                        aria-label="Удалить"
                      >
                        <Icon name="Trash2" size={13} />
                      </button>
                    </div>
                  </div>

                  {ev.trophies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ev.trophies.map((t, i) => (
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

                  {ev.photos.length > 0 && (
                    <div className="mt-3 flex gap-1.5">
                      {ev.photos.map((p, i) => (
                        <img key={i} src={p} alt="" className="h-12 w-12 rounded-sm object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <HuntEventViewer
        open={viewOpen}
        onOpenChange={setViewOpen}
        event={viewEvent}
        onEdit={openEdit}
        onDelete={onRemove}
      />

      <HuntEventEditor
        open={open}
        onOpenChange={setOpen}
        hunterId={hunterId}
        editEvent={editEvent}
        initialDate={initialDate}
        onSaved={onUpsert}
      />
    </section>
  );
};

export default MyCalendar;