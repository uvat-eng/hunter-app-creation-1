import { useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';
import type { HuntEventDto } from '@/lib/api';
import HuntEventEditor from './HuntEventEditor';
import HuntEventViewer from './HuntEventViewer';

const tags = ['Все', 'Перо', 'Копытные'];

interface Props {
  hunterId?: string;
  events: HuntEventDto[];
  loading: boolean;
  onUpsert: (saved: HuntEventDto) => void;
  onRemove?: (id: string) => void;
}

const formatBudget = (n: number | null) => (n ? `${n.toLocaleString('ru')} ₽` : '—');

const Hunts = ({ hunterId, events = [], loading, onUpsert, onRemove }: Props) => {
  const [filter, setFilter] = useState('Все');
  const [editEvent, setEditEvent] = useState<HuntEventDto | null>(null);
  const [open, setOpen] = useState(false);
  const [viewEvent, setViewEvent] = useState<HuntEventDto | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const rows = [...events]
    .filter((h) => filter === 'Все' || h.huntType === filter)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const openEdit = (ev: HuntEventDto) => {
    setViewOpen(false);
    setEditEvent(ev);
    setOpen(true);
  };

  const openView = (ev: HuntEventDto) => {
    setViewEvent(ev);
    setViewOpen(true);
  };

  return (
    <section id="hunts" className="border-t border-border bg-hero-bg py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Мои охоты и трофеи"
          title="Дневник выездов"
          description="Дневник формируется автоматически из вашего календаря выездов — каждое добавленное событие сразу появляется здесь. Данные можно уточнить, нажав на строку."
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-sm border px-4 py-2 text-sm transition-colors ${
                filter === t
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-hero-muted hover:border-primary/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden grid-cols-[1fr_1.4fr_1fr_1.2fr_1fr] gap-4 border-b border-border bg-hero-surface px-6 py-4 text-xs uppercase tracking-wide text-hero-muted md:grid">
            <span>Дата</span>
            <span>Место</span>
            <span>Дичь</span>
            <span>Результат</span>
            <span className="text-right">Бюджет</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 bg-hero-surface/50 py-10 text-sm text-hero-muted">
              <Icon name="Loader2" size={18} className="animate-spin" /> Загружаем…
            </div>
          ) : !hunterId ? (
            <div className="flex flex-col items-center gap-2 bg-hero-surface/50 py-10 text-center text-sm text-hero-muted">
              <Icon name="BookOpen" size={26} className="text-hero-muted" />
              Заведите карточку охотника и добавьте событие в календарь — дневник заполнится сам.
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 bg-hero-surface/50 py-10 text-center text-sm text-hero-muted">
              <Icon name="BookOpen" size={26} className="text-hero-muted" />
              Событий пока нет — добавьте выезд в календаре выше, он появится здесь автоматически.
            </div>
          ) : (
            rows.map((h) => (
              <button
                key={h.id}
                onClick={() => openView(h)}
                className="grid w-full grid-cols-2 gap-3 border-b border-border bg-hero-surface/50 px-6 py-4 text-left text-sm transition-colors last:border-0 hover:bg-hero-surface md:grid-cols-[1fr_1.4fr_1fr_1.2fr_1fr] md:gap-4"
              >
                <span className="font-medium text-hero-text">{new Date(h.date).toLocaleDateString('ru')}</span>
                <span className="flex items-center gap-2 text-hero-muted">
                  <Icon name="MapPin" size={15} className="text-primary" />
                  {h.locationName || '—'}
                </span>
                <span className="text-hero-muted">{h.huntType}</span>
                <span className="flex items-center gap-2 text-hero-text">
                  <Icon name="Award" size={15} className="text-primary" />
                  {h.trophies.length > 0
                    ? h.trophies.map((t) => `${t.game} × ${t.count}`).join(', ')
                    : h.status === 'planned'
                      ? 'Запланировано'
                      : 'Без трофеев'}
                </span>
                <span className="text-right font-medium text-hero-text md:text-right">{formatBudget(h.budget)}</span>
              </button>
            ))
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
        onSaved={onUpsert}
      />
    </section>
  );
};

export default Hunts;