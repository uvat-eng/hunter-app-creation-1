import { useEffect, useMemo, useState } from 'react';
import SectionHeading from './SectionHeading';
import RussiaMap from './RussiaMap';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { huntEventsApi, type HuntEventDto, type TrophyDto } from '@/lib/api';
import { downloadIcs } from '@/lib/ics';

type Draft = Omit<HuntEventDto, 'id' | 'hunterId'>;

const emptyDraft = (): Draft => ({
  title: '',
  huntType: 'Перо',
  date: '',
  status: 'planned',
  locationName: '',
  mapX: null,
  mapY: null,
  notes: '',
  reminder: true,
  trophies: [],
  photos: [],
  budget: null,
});

const huntTypes = ['Перо', 'Копытные', 'Пушнина', 'Заяц', 'Кабан', 'Лось', 'Другое'];

const SPECIES = [
  { key: 'moose', label: 'Лось', match: ['лос'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/447a74f5-7026-4c0f-88fe-3b65c0c9eeb8.jpg' },
  { key: 'roe', label: 'Косуля', match: ['косул'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/0bd53a4f-4857-4166-9079-da641161665e.jpg' },
  { key: 'boar', label: 'Кабан', match: ['кабан', 'вепр'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/4265ab49-61d8-4a4b-9eae-f86fb5ccf6e8.jpg' },
  { key: 'lynx', label: 'Рысь', match: ['рысь', 'рыс'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/b11f484b-3c29-4f77-9b1b-e5206feab5ce.jpg' },
  { key: 'wolf', label: 'Волк', match: ['волк', 'волч'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/a74be7ee-3caa-448e-b296-cbe0060df08e.jpg' },
  { key: 'bear', label: 'Медведь', match: ['медвед'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/1bb91a26-7f33-48d4-9567-0205657d139f.jpg' },
  { key: 'duck', label: 'Утки', match: ['утк', 'кряк'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/1d5d70fd-30b8-4548-b3ff-657420f75182.jpg' },
  { key: 'goose', label: 'Гуси', match: ['гус'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/da3c22d7-4009-40a1-a700-30f634d49a56.jpg' },
  { key: 'musk', label: 'Кабарга', match: ['кабарг'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/8b7ac197-f59a-4bd6-b6e8-37a3a325fb2a.jpg' },
  { key: 'beaver', label: 'Бобёр', match: ['бобр', 'бобер', 'бобё'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/4f7e9b9c-2512-4016-a553-373956342b1b.jpg' },
  { key: 'wolverine', label: 'Росомаха', match: ['росомах'], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/6421fde9-abf4-47b1-a9f0-3cc1b221ce59.jpg' },
  { key: 'other', label: 'Иные', match: [], icon: 'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/f564d534-d007-454f-92fb-e592a94bdbe9.jpg' },
] as const;

const matchSpecies = (game: string) => {
  const g = game.toLowerCase();
  for (const s of SPECIES) {
    if (s.match.some((m) => g.includes(m))) return s.key;
  }
  return 'other';
};

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const months = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const steps = [
  { title: 'Событие', desc: 'Название, вид охоты, дата и статус' },
  { title: 'Место', desc: 'Где проходила или пройдёт охота — отметьте точку на карте' },
  { title: 'Трофеи', desc: 'Что удалось добыть (если охота уже состоялась)' },
  { title: 'Фотографии', desc: 'До 5 фотографий с охоты' },
  { title: 'Напоминание', desc: 'Добавить событие в календарь телефона' },
];

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;

const fileToCompressedDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const MyCalendar = ({ hunterId }: { hunterId?: string }) => {
  const now = new Date();
  const [events, setEvents] = useState<HuntEventDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hunterId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    huntEventsApi
      .list(hunterId)
      .then(setEvents)
      .catch(() => toast({ title: 'Не удалось загрузить календарь' }))
      .finally(() => setLoading(false));
  }, [hunterId]);

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
    setDraft({ ...emptyDraft(), date: dateStr || '' });
    setEditId(null);
    setStep(0);
    setOpen(true);
  };

  const openEdit = (ev: HuntEventDto) => {
    const { id, hunterId: _h, ...rest } = ev;
    setDraft(rest);
    setEditId(id);
    setStep(0);
    setOpen(true);
  };

  const removeEvent = async (id: string) => {
    try {
      await huntEventsApi.remove(id);
      setEvents((es) => es.filter((e) => e.id !== id));
      toast({ title: 'Событие удалено' });
    } catch {
      toast({ title: 'Не удалось удалить' });
    }
  };

  const addTrophy = () => setDraft((d) => ({ ...d, trophies: [...d.trophies, { game: '', count: '1' }] }));
  const setTrophy = (i: number, patch: Partial<TrophyDto>) =>
    setDraft((d) => ({ ...d, trophies: d.trophies.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) }));
  const removeTrophy = (i: number) =>
    setDraft((d) => ({ ...d, trophies: d.trophies.filter((_, idx) => idx !== i) }));

  const onPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const room = 5 - draft.photos.length;
    const toAdd = files.slice(0, room);
    try {
      const dataUrls = await Promise.all(toAdd.map(fileToCompressedDataUrl));
      setDraft((d) => ({ ...d, photos: [...d.photos, ...dataUrls] }));
    } catch {
      toast({ title: 'Не удалось обработать фото', description: 'Попробуйте другой файл.' });
    }
    e.target.value = '';
  };

  const removePhoto = (i: number) => setDraft((d) => ({ ...d, photos: d.photos.filter((_, idx) => idx !== i) }));

  const validateStep0 = () => {
    if (!draft.title.trim() || !draft.date) {
      toast({ title: 'Укажите название и дату события' });
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 0 && !validateStep0()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const save = async () => {
    if (!hunterId) return;
    if (!validateStep0()) {
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...draft, hunterId };
      const saved = editId ? await huntEventsApi.update(editId, payload) : await huntEventsApi.create(payload);
      setEvents((es) => (editId ? es.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...es]));
      toast({ title: editId ? 'Событие обновлено' : 'Событие добавлено в дневник', description: saved.title });
      if (draft.reminder) {
        downloadIcs({
          title: saved.title,
          date: saved.date,
          description: [saved.huntType, saved.notes].filter(Boolean).join(' · '),
          location: saved.locationName,
          reminderMinutesBefore: 12 * 60,
        });
        toast({ title: 'Файл события скачан', description: 'Откройте его, чтобы добавить в календарь телефона.' });
      }
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error && err.message.includes('413')
        ? 'Слишком большие фотографии — уменьшите их количество или выберите файлы поменьше.'
        : 'Проверьте соединение и попробуйте ещё раз.';
      toast({ title: 'Не удалось сохранить событие', description: msg });
    } finally {
      setSaving(false);
    }
  };

  const isLast = step === steps.length - 1;
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
          description="Отмечайте планируемые и завершённые охоты, добавляйте трофеи и точку на карте — события можно перенести в календарь телефона с напоминанием."
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
                return (
                  <button
                    key={i}
                    onClick={() => (dayEvents.length ? openEdit(dayEvents[0]) : openAdd(dateStr))}
                    className={`relative aspect-square rounded-sm text-sm font-medium transition-all ${
                      dayEvents.length
                        ? 'bg-primary/15 text-hero-text hover:bg-primary/25'
                        : 'text-hero-text hover:bg-primary/10'
                    }`}
                  >
                    {d}
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
                  className="group rounded-sm border border-border bg-hero-surface p-4 transition-colors hover:border-primary/40"
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
                    </div>
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() =>
                          downloadIcs({
                            title: ev.title,
                            date: ev.date,
                            description: [ev.huntType, ev.notes].filter(Boolean).join(' · '),
                            location: ev.locationName,
                            reminderMinutesBefore: 12 * 60,
                          })
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
                        aria-label="В календарь телефона"
                      >
                        <Icon name="CalendarPlus" size={13} />
                      </button>
                      <button
                        onClick={() => openEdit(ev)}
                        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
                        aria-label="Редактировать"
                      >
                        <Icon name="Pencil" size={13} />
                      </button>
                      <button
                        onClick={() => removeEvent(ev.id)}
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

      {/* Мастер добавления/редактирования события */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">{steps[step].title}</DialogTitle>
            <DialogDescription className="text-hero-muted">{steps[step].desc}</DialogDescription>
          </DialogHeader>

          <div className="mb-1 flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-secondary'}`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ev-title" className="text-hero-muted">Название события</Label>
                <Input
                  id="ev-title"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Утиная охота на озере"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ev-date" className="text-hero-muted">Дата</Label>
                  <Input
                    id="ev-date"
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    className="mt-1.5 border-border bg-hero-bg"
                  />
                </div>
                <div>
                  <Label htmlFor="ev-type" className="text-hero-muted">Вид охоты</Label>
                  <select
                    id="ev-type"
                    value={draft.huntType}
                    onChange={(e) => setDraft((d) => ({ ...d, huntType: e.target.value }))}
                    className="mt-1.5 flex h-10 w-full rounded-sm border border-border bg-hero-bg px-3 text-sm text-hero-text"
                  >
                    {huntTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-hero-muted">Статус</Label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, status: 'planned' }))}
                    className={`flex-1 rounded-sm border px-4 py-2.5 text-sm transition-colors ${
                      draft.status === 'planned'
                        ? 'border-primary bg-primary/10 text-hero-text'
                        : 'border-border text-hero-muted hover:border-primary/50'
                    }`}
                  >
                    <Icon name="CalendarClock" size={14} className="mr-1.5 inline" /> Запланирована
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, status: 'done' }))}
                    className={`flex-1 rounded-sm border px-4 py-2.5 text-sm transition-colors ${
                      draft.status === 'done'
                        ? 'border-primary bg-primary/10 text-hero-text'
                        : 'border-border text-hero-muted hover:border-primary/50'
                    }`}
                  >
                    <Icon name="CheckCircle2" size={14} className="mr-1.5 inline" /> Состоялась
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="ev-budget" className="text-hero-muted">
                  {draft.status === 'done' ? 'Фактические затраты, ₽' : 'Плановый бюджет, ₽'}
                </Label>
                <Input
                  id="ev-budget"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={draft.budget ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, budget: e.target.value === '' ? null : Number(e.target.value) }))
                  }
                  placeholder="0"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <div>
                <Label htmlFor="ev-notes" className="text-hero-muted">Заметка</Label>
                <Textarea
                  id="ev-notes"
                  value={draft.notes}
                  onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                  placeholder="Погода, состав группы, впечатления…"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ev-loc" className="text-hero-muted">Название места</Label>
                <Input
                  id="ev-loc"
                  value={draft.locationName}
                  onChange={(e) => setDraft((d) => ({ ...d, locationName: e.target.value }))}
                  placeholder="Озёрный сектор, Малышенское"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <div>
                <Label className="text-hero-muted">Точка на карте — нажмите, чтобы отметить</Label>
                <div className="mt-1.5">
                  <RussiaMap
                    x={draft.mapX}
                    y={draft.mapY}
                    onPick={(x, y) => setDraft((d) => ({ ...d, mapX: x, mapY: y }))}
                  />
                </div>
                {draft.mapX !== null && (
                  <button
                    onClick={() => setDraft((d) => ({ ...d, mapX: null, mapY: null }))}
                    className="mt-2 text-xs text-hero-muted underline-offset-2 hover:text-hero-text hover:underline"
                  >
                    Сбросить точку
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {draft.status !== 'done' && (
                <p className="rounded-sm border border-dashed border-border bg-hero-bg px-4 py-3 text-sm text-hero-muted">
                  Трофеи можно указать, когда охота уже состоялась. Пропустите этот шаг для запланированной охоты.
                </p>
              )}
              {draft.trophies.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={t.game}
                    onChange={(e) => setTrophy(i, { game: e.target.value })}
                    placeholder="Кряква"
                    className="border-border bg-hero-bg"
                  />
                  <Input
                    value={t.count}
                    onChange={(e) => setTrophy(i, { count: e.target.value })}
                    placeholder="1"
                    className="w-20 border-border bg-hero-bg"
                  />
                  <button
                    onClick={() => removeTrophy(i)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border text-hero-muted hover:border-destructive hover:text-destructive"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addTrophy}
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border py-2.5 text-sm text-hero-muted transition-colors hover:border-primary hover:text-hero-text"
              >
                <Icon name="Plus" size={15} /> Добавить трофей
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {draft.photos.map((p, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-sm border border-border">
                    <img src={p} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
                {draft.photos.length < 5 && (
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-sm border border-dashed border-border text-hero-muted transition-colors hover:border-primary hover:text-primary">
                    <Icon name="Camera" size={20} />
                    <input type="file" accept="image/*" multiple onChange={onPhotos} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-xs text-hero-muted">До 5 фотографий, {5 - draft.photos.length} осталось.</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, reminder: !d.reminder }))}
                className={`flex w-full items-center gap-3 rounded-sm border px-4 py-4 text-left transition-colors ${
                  draft.reminder ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
                    draft.reminder ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  }`}
                >
                  {draft.reminder && <Icon name="Check" size={13} />}
                </span>
                <span>
                  <span className="block text-sm font-medium text-hero-text">Добавить в календарь телефона</span>
                  <span className="mt-0.5 block text-xs text-hero-muted">
                    После сохранения скачается файл события — откройте его на телефоне, чтобы добавить в календарь с
                    напоминанием за 12 часов.
                  </span>
                </span>
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {step > 0 && (
              <button
                onClick={goBack}
                className="rounded-sm border border-border px-4 py-3 text-hero-muted transition-colors hover:text-hero-text"
              >
                <Icon name="ArrowLeft" size={18} />
              </button>
            )}
            {isLast ? (
              <button
                onClick={save}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {saving ? 'Сохраняем…' : 'Сохранить событие'}{' '}
                <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Далее <Icon name="ArrowRight" size={18} />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MyCalendar;