import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { huntEventsApi, type HuntEventDto, type TrophyDto } from '@/lib/api';
import { addToDeviceCalendar } from '@/lib/device-calendar';
import HuntEventDetailsStep from './HuntEventDetailsStep';
import HuntEventTrophiesStep from './HuntEventTrophiesStep';
import { HuntEventPhotosStep, HuntEventVideosStep } from './HuntEventMediaStep';
import { HuntEventLocationStep, HuntEventReminderStep } from './HuntEventLocationStep';

export type Draft = Omit<HuntEventDto, 'id' | 'hunterId'>;

export const emptyDraft = (): Draft => ({
  title: '',
  huntType: 'Перо',
  date: '',
  status: 'planned',
  locationName: '',
  lat: null,
  lng: null,
  region: '',
  notes: '',
  reminder: true,
  trophies: [],
  photos: [],
  videos: [],
  budget: null,
});

const steps = [
  { title: 'Событие', desc: 'Название, вид охоты, дата и статус' },
  { title: 'Место', desc: 'Введите адрес — точка на карте появится автоматически, или отметьте вручную' },
  { title: 'Трофеи', desc: 'Что удалось добыть (если охота уже состоялась)' },
  { title: 'Фотографии', desc: 'До 5 фотографий с охоты' },
  { title: 'Видео', desc: 'До 3 видео с охоты (каждое до 30 МБ)' },
  { title: 'Напоминание', desc: 'Добавить событие в календарь телефона' },
];

const MAX_VIDEO_MB = 30;
const MAX_VIDEOS = 3;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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

  const onVideos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const room = MAX_VIDEOS - draft.videos.length;
    const toAdd = files.slice(0, room);
    const tooBig = toAdd.filter((f) => f.size > MAX_VIDEO_MB * 1024 * 1024);
    if (tooBig.length) {
      toast({ title: 'Видео слишком большое', description: `Максимум ${MAX_VIDEO_MB} МБ на файл.` });
    }
    const okFiles = toAdd.filter((f) => f.size <= MAX_VIDEO_MB * 1024 * 1024);
    try {
      const dataUrls = await Promise.all(okFiles.map(fileToDataUrl));
      setDraft((d) => ({ ...d, videos: [...d.videos, ...dataUrls] }));
    } catch {
      toast({ title: 'Не удалось обработать видео', description: 'Попробуйте другой файл.' });
    }
    e.target.value = '';
  };

  const removeVideo = (i: number) => setDraft((d) => ({ ...d, videos: d.videos.filter((_, idx) => idx !== i) }));

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
        const added = await addToDeviceCalendar({
          title: saved.title,
          date: saved.date,
          description: [saved.huntType, saved.notes].filter(Boolean).join(' · '),
          location: saved.locationName,
          reminderMinutesBefore: 12 * 60,
        });
        toast(
          added
            ? { title: 'Событие добавлено в календарь телефона' }
            : { title: 'Файл события скачан', description: 'Откройте его, чтобы добавить в календарь телефона.' },
        );
      }
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error && err.message.includes('413')
        ? 'Слишком большие файлы — уменьшите количество фото/видео или выберите файлы поменьше.'
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

        {step === 0 && <HuntEventDetailsStep draft={draft} setDraft={setDraft} />}

        {step === 1 && <HuntEventLocationStep draft={draft} setDraft={setDraft} />}

        {step === 2 && (
          <HuntEventTrophiesStep
            draft={draft}
            addTrophy={addTrophy}
            setTrophy={setTrophy}
            removeTrophy={removeTrophy}
          />
        )}

        {step === 3 && <HuntEventPhotosStep draft={draft} onPhotos={onPhotos} removePhoto={removePhoto} />}

        {step === 4 && (
          <HuntEventVideosStep
            draft={draft}
            maxVideos={MAX_VIDEOS}
            maxVideoMb={MAX_VIDEO_MB}
            onVideos={onVideos}
            removeVideo={removeVideo}
          />
        )}

        {step === 5 && <HuntEventReminderStep draft={draft} setDraft={setDraft} />}

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
