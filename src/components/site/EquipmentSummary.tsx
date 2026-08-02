import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { getEquipmentTotals, type EquipmentTotals } from '@/lib/equipment-totals';

const formatMoney = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const rows = [
  { key: 'weaponryBudget' as const, icon: 'Target', label: 'Оружейный бюджет', href: '/gear' },
  { key: 'carsTotalCost' as const, icon: 'Car', label: 'Автомобильный бюджет', href: '/car' },
  { key: 'huntsBudget' as const, icon: 'CalendarDays', label: 'Бюджет выездов', href: '/hunts' },
];

const EquipmentSummary = ({ hunterId }: { hunterId?: string }) => {
  const [totals, setTotals] = useState<EquipmentTotals | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hunterId) {
      setTotals(null);
      return;
    }
    setLoading(true);
    getEquipmentTotals(hunterId)
      .then(setTotals)
      .finally(() => setLoading(false));
  }, [hunterId]);

  if (!hunterId || loading || !totals || totals.grandTotal === 0) return null;

  return (
    <div className="mt-8 rounded-lg border border-primary/40 bg-primary/10 px-6 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-head text-lg font-bold uppercase tracking-wide text-hero-text md:text-xl">
          Бюджет охотника
        </span>
        <span className="font-head text-3xl font-bold text-primary md:text-4xl">
          {formatMoney(totals.grandTotal)}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-10 gap-y-3 border-t border-primary/30 pt-4">
        {rows.map((r) => (
          <Link
            key={r.key}
            to={r.href}
            className="flex items-center gap-2 text-sm text-hero-muted transition-colors hover:text-primary"
          >
            <Icon name={r.icon} size={14} className="shrink-0 text-primary" />
            {r.label}
            <span className="font-medium text-hero-text">{formatMoney(totals[r.key])}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EquipmentSummary;
