import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { huntTypes } from '@/lib/hunt-species';
import type { Draft } from './HuntEventEditor';

interface Props {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
}

const HuntEventDetailsStep = ({ draft, setDraft }: Props) => (
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
);

export default HuntEventDetailsStep;
