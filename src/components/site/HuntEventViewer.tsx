import { useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { HuntEventDto } from '@/lib/api';
import { addToDeviceCalendar } from '@/lib/device-calendar';
import { toast } from '@/hooks/use-toast';
import WeatherWidget from './WeatherWidget';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: HuntEventDto | null;
  onEdit: (ev: HuntEventDto) => void;
  onDelete?: (id: string) => void;
}

const HuntEventViewer = ({ open, onOpenChange, event, onEdit, onDelete }: Props) => {
  const [mediaTab, setMediaTab] = useState<'photos' | 'videos'>('photos');
  const [activeIndex, setActiveIndex] = useState(0);

  if (!event) return null;

  const media = mediaTab === 'photos' ? event.photos : event.videos;

  const switchTab = (tab: 'photos' | 'videos') => {
    setMediaTab(tab);
    setActiveIndex(0);
  };

  const hasPhotos = event.photos.length > 0;
  const hasVideos = event.videos.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border bg-hero-surface text-hero-text">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${event.status === 'planned' ? 'bg-primary' : 'bg-hero-muted'}`} />
            <span className="text-xs uppercase tracking-wide text-hero-muted">
              {event.status === 'planned' ? 'Запланировано' : 'Состоялось'} · {event.huntType}
            </span>
          </div>
          <DialogTitle className="font-head text-2xl font-bold tracking-tight">{event.title}</DialogTitle>
          <DialogDescription className="text-hero-muted">
            {new Date(event.date).toLocaleDateString('ru')}
            {event.locationName ? ` · ${event.locationName}` : ''}
          </DialogDescription>
        </DialogHeader>

        {(hasPhotos || hasVideos) && (
          <div>
            {hasPhotos && hasVideos && (
              <div className="mb-2 flex gap-2">
                <button
                  onClick={() => switchTab('photos')}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
                    mediaTab === 'photos'
                      ? 'border-primary bg-primary/10 text-hero-text'
                      : 'border-border text-hero-muted hover:border-primary/50'
                  }`}
                >
                  <Icon name="Image" size={13} className="mr-1 inline" /> Фото ({event.photos.length})
                </button>
                <button
                  onClick={() => switchTab('videos')}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
                    mediaTab === 'videos'
                      ? 'border-primary bg-primary/10 text-hero-text'
                      : 'border-border text-hero-muted hover:border-primary/50'
                  }`}
                >
                  <Icon name="Video" size={13} className="mr-1 inline" /> Видео ({event.videos.length})
                </button>
              </div>
            )}

            <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-border bg-hero-bg">
              {mediaTab === 'photos' ? (
                <img src={media[activeIndex]} alt="" className="h-full w-full object-contain" />
              ) : (
                <video src={media[activeIndex]} controls className="h-full w-full object-contain" />
              )}

              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIndex((i) => (i - 1 + media.length) % media.length)}
                    className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                    aria-label="Предыдущее"
                  >
                    <Icon name="ChevronLeft" size={18} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((i) => (i + 1) % media.length)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                    aria-label="Следующее"
                  >
                    <Icon name="ChevronRight" size={18} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {media.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          i === activeIndex ? 'bg-primary' : 'bg-white/50'
                        }`}
                        aria-label={`Слайд ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {media.length > 1 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto">
                {media.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-12 w-16 shrink-0 overflow-hidden rounded-sm border transition-colors ${
                      i === activeIndex ? 'border-primary' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    {mediaTab === 'photos' ? (
                      <img src={m} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <video src={m} className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {event.status === 'planned' && event.lat !== null && event.lng !== null && (
          <WeatherWidget lat={event.lat} lng={event.lng} date={event.date} className="mt-1" />
        )}

        <div className="space-y-3 border-t border-border pt-4">
          {event.trophies.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs uppercase tracking-wide text-hero-muted">Трофеи</div>
              <div className="flex flex-wrap gap-1.5">
                {event.trophies.map((t, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-hero-muted"
                  >
                    <Icon name="Award" size={11} className="text-primary" />
                    {t.game} × {t.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.budget !== null && (
            <div className="flex items-center gap-2 text-sm text-hero-muted">
              <Icon name="Wallet" size={16} className="shrink-0 text-primary" />
              {event.status === 'planned' ? 'Плановый бюджет' : 'Затраты'}:{' '}
              <span className="font-medium text-hero-text">{event.budget.toLocaleString('ru')} ₽</span>
            </div>
          )}

          {event.region && (
            <div className="flex items-center gap-2 text-sm text-hero-muted">
              <Icon name="Map" size={16} className="shrink-0 text-primary" />
              {event.region}
            </div>
          )}

          {event.notes && (
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-hero-muted">Заметка</div>
              <p className="text-sm text-hero-text">{event.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={async () => {
              const added = await addToDeviceCalendar({
                title: event.title,
                date: event.date,
                description: [event.huntType, event.notes].filter(Boolean).join(' · '),
                location: event.locationName,
                reminderMinutesBefore: 12 * 60,
              });
              toast(
                added
                  ? { title: 'Событие добавлено в календарь телефона' }
                  : { title: 'Файл события скачан', description: 'Откройте его, чтобы добавить в календарь телефона.' },
              );
            }}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
            aria-label="В календарь телефона"
          >
            <Icon name="CalendarPlus" size={16} />
          </button>
          {onDelete && (
            <button
              onClick={() => {
                onDelete(event.id);
                onOpenChange(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-destructive hover:text-destructive"
              aria-label="Удалить"
            >
              <Icon name="Trash2" size={16} />
            </button>
          )}
          <button
            onClick={() => onEdit(event)}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-2.5 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Icon name="Pencil" size={16} /> Редактировать
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HuntEventViewer;