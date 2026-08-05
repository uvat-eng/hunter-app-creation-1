import Icon from '@/components/ui/icon';
import type { HuntEventDto } from '@/lib/api';
import { getHunterStats } from '@/lib/hunter-stats';

const items = [
  { key: 'huntsDone' as const, icon: 'CheckCircle2', label: 'состоявшихся охот' },
  { key: 'mapPoints' as const, icon: 'MapPin', label: 'точек на карте' },
  { key: 'regionsCount' as const, icon: 'Compass', label: 'регионов освоено' },
  { key: 'seasonTrophies' as const, icon: 'Award', label: 'трофеев за сезон' },
];

const HunterStatsBanner = ({ events = [] }: { events?: HuntEventDto[] }) => {
  const stats = getHunterStats(events);

  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-hero-surface to-hero-bg px-6 py-8 md:px-10">
      <div className="flex items-center gap-2">
        <Icon name="TrendingUp" size={16} className="text-primary" />
        <span className="text-xs uppercase tracking-[0.2em] text-hero-accent">Ваша статистика</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.key} className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Icon name={item.icon} size={20} />
            </span>
            <div className="font-head text-3xl font-bold text-hero-text md:text-4xl">{stats[item.key]}</div>
            <div className="text-xs text-hero-muted">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HunterStatsBanner;
