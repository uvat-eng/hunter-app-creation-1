import Icon from '@/components/ui/icon';
import type { WeaponDto, AccessoryDto } from '@/lib/api';

const formatMoney = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const AccessoryRow = ({ icon, label, acc }: { icon: string; label: string; acc: AccessoryDto }) => (
  <div className="flex items-start gap-2.5">
    <Icon name={icon} size={15} className="mt-0.5 shrink-0 text-primary" />
    <div>
      <span className="text-sm font-medium text-hero-text">
        {label}: {acc.name}
      </span>
      {acc.params && <div className="text-xs text-hero-muted">{acc.params}</div>}
    </div>
  </div>
);

interface Props {
  weapon: WeaponDto;
  onEdit: (w: WeaponDto) => void;
  onRemove: (id: string) => void;
}

const WeaponCard = ({ weapon: w, onEdit, onRemove }: Props) => (
  <div className="group relative rounded-lg border border-border bg-hero-bg p-6 transition-all hover:-translate-y-1 hover:border-primary/50">
    <div className="flex items-center justify-between">
      {w.photo ? (
        <img src={w.photo} alt={w.name} className="h-12 w-12 rounded-sm object-cover" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/12 text-primary">
          <Icon name="Target" size={24} />
        </span>
      )}
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(w)}
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
          aria-label="Редактировать"
        >
          <Icon name="Pencil" size={15} />
        </button>
        <button
          onClick={() => onRemove(w.id)}
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-destructive hover:text-destructive"
          aria-label="Удалить"
        >
          <Icon name="Trash2" size={15} />
        </button>
      </div>
    </div>

    <h3 className="mt-5 font-head text-2xl font-semibold text-hero-text">{w.name}</h3>
    <p className="text-sm text-hero-muted">{w.caliber}</p>

    <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm text-hero-muted">
      <div className="flex items-center gap-2">
        <Icon name="ShieldCheck" size={16} className="shrink-0 text-primary" />
        {w.permit}
        {w.permitPhoto && (
          <a
            href={w.permitPhoto}
            target="_blank"
            rel="noreferrer"
            className="ml-1 text-xs text-primary underline-offset-2 hover:underline"
          >
            фото
          </a>
        )}
      </div>
      {w.permitDate && (
        <div className="flex items-center gap-2">
          <Icon name="CalendarClock" size={16} className="shrink-0 text-primary" />
          Выдано {w.permitDate}
        </div>
      )}
    </div>

    {(w.optics || w.thermal || w.collimator) && (
      <div className="mt-4 space-y-2.5 border-t border-border pt-4">
        {w.optics && <AccessoryRow icon="Telescope" label="Оптика" acc={w.optics} />}
        {w.thermal && <AccessoryRow icon="Flame" label="Тепловизор" acc={w.thermal} />}
        {w.collimator && <AccessoryRow icon="ScanEye" label="Коллиматор" acc={w.collimator} />}
      </div>
    )}

    {w.cost !== null && w.cost !== undefined && (
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-primary">
        <Icon name="Wallet" size={16} className="shrink-0" />
        {formatMoney(w.cost)}
      </div>
    )}
  </div>
);

export default WeaponCard;
