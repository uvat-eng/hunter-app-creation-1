import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import type { TrophyDto } from '@/lib/api';
import type { Draft } from './HuntEventEditor';

interface Props {
  draft: Draft;
  addTrophy: () => void;
  setTrophy: (i: number, patch: Partial<TrophyDto>) => void;
  removeTrophy: (i: number) => void;
}

const HuntEventTrophiesStep = ({ draft, addTrophy, setTrophy, removeTrophy }: Props) => (
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
);

export default HuntEventTrophiesStep;
