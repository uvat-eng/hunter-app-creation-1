import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { getEquipmentTotals, type EquipmentTotals } from '@/lib/equipment-totals';

const formatMoney = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const rows = [
  { key: 'weaponsCost' as const, icon: 'Target', label: 'Оружие', href: '/gear' },
  { key: 'accessoriesCost' as const, icon: 'Binoculars', label: 'Оружейные аксессуары', href: '/gear' },
  { key: 'carsTotalCost' as const, icon: 'Car', label: 'Автомобили', href: '/car' },
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
    <div className="mt-6 rounded-lg border border-primary/40 bg-primary/10 p-6">
      <div className="text-xs uppercase tracking-wide text-hero-muted">Общая стоимость имущества охотника</div>
      <div className="mt-1 font-head text-3xl font-bold text-primary md:text-4xl">{formatMoney(totals.grandTotal)}</div>

      <div className="mt-5 space-y-3 border-t border-primary/30 pt-4">
        {rows.map((r) => (
          <Link
            key={r.key}
            to={r.href}
            className="flex items-center justify-between gap-3 text-sm transition-colors hover:text-primary"
          >
            <span className="flex items-center gap-2 text-hero-muted">
              <Icon name={r.icon} size={15} className="shrink-0 text-primary" />
              {r.label}
            </span>
            <span className="font-medium text-hero-text">{formatMoney(totals[r.key])}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EquipmentSummary;
