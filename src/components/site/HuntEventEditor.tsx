import { useEffect, useState } from 'react';
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
import { huntTypes } from '@/lib/hunt-species';

export type Draft = Omit<HuntEventDto, 'id' | 'hunterId'>;

export const emptyDraft = (): Draft => ({
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hunterId?: string;
  editEvent: HuntEventDto | null;
  initialDate?: string;
  onSaved: (saved: HuntEventDto) => void;
}

const HuntEventEditor = ({ open, onOpenChange, hunterId, editEvent, initialDate, onSaved }: Props) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editEvent) {
      const { id, hunterId: _h, ...rest } = editEvent;
      setDraft(rest);
    } else {
      setDraft({ ...emptyDraft(), date: initialDate || '' });
    }
    setStep(0);
  }, [open, editEvent, initialDate]);

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
      const saved = editEvent
        ? await huntEventsApi.update(editEvent.id, payload)
        : await huntEventsApi.create(payload);
      onSaved(saved);
      toast({ title: editEvent ? 'Событие обновлено' : 'Событие добавлено в дневник', description: saved.title });
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
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
};

export default HuntEventEditor;
