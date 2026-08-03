import Icon from '@/components/ui/icon';
import type { WeaponDto } from '@/lib/api';
import WeaponCard from './WeaponCard';

const formatMoney = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

interface Props {
  weapons: WeaponDto[];
  loading: boolean;
  hunterId?: string;
  onAdd: () => void;
  onEdit: (w: WeaponDto) => void;
  onRemove: (id: string) => void;
}

const WeaponsGrid = ({ weapons, loading, hunterId, onAdd, onEdit, onRemove }: Props) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-hero-bg px-6 py-16 text-hero-muted">
        <Icon name="Loader2" size={20} className="animate-spin" /> Загружаем сейф…
      </div>
    );
  }

  if (weapons.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-hero-bg px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Icon name="Target" size={26} />
        </span>
        <div>
          <div className="font-head text-lg font-semibold text-hero-text">Пока нет оружия в учёте</div>
          <p className="mt-1 text-sm text-hero-muted">
            {hunterId
              ? 'Добавьте первую единицу — это займёт меньше минуты.'
              : 'Заведите карточку охотника, чтобы начать учёт.'}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          <Icon name="Plus" size={18} /> Добавить оружие
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {weapons.map((w) => (
          <WeaponCard key={w.id} weapon={w} onEdit={onEdit} onRemove={onRemove} />
        ))}

        <button
          onClick={onAdd}
          className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
        >
          <Icon name="Plus" size={28} />
          <span className="text-sm font-medium">Добавить оружие</span>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 p-5">
        <div className="text-sm font-medium text-hero-text">Общая стоимость оружейного сейфа</div>
        <div className="font-head text-2xl font-bold text-primary">
          {formatMoney(weapons.reduce((sum, w) => sum + (w.cost || 0), 0))}
        </div>
      </div>
    </>
  );
};

export default WeaponsGrid;
