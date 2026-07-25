import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';

const weapons = [
  {
    name: 'МР-155',
    type: 'Гладкоствольное · 12×76',
    permit: 'РОХа до 2027',
    status: 'Активно',
    icon: 'Target',
  },
  {
    name: 'Тигр (СВД)',
    type: 'Нарезное · 7.62×54',
    permit: 'РОХа до 2026',
    status: 'Активно',
    icon: 'Crosshair',
  },
  {
    name: 'ИЖ-27',
    type: 'Гладкоствольное · 12×70',
    permit: 'На хранении',
    status: 'В сейфе',
    icon: 'Archive',
  },
];

const Gear = () => (
  <section id="gear" className="border-t border-border bg-hero-surface py-20 md:py-28">
    <div className="mx-auto max-w-7xl px-5 md:px-10">
      <SectionHeading
        eyebrow="Моё оружие и снаряжение"
        title="Оружейный сейф"
        description="Учёт стволов, сроки разрешений и статус хранения — всё под контролем, чтобы РОХа не просрочилась."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {weapons.map((w) => (
          <div
            key={w.name}
            className="group rounded-lg border border-border bg-hero-bg p-6 transition-all hover:-translate-y-1 hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon name={w.icon} size={24} />
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  w.status === 'Активно'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-secondary text-hero-muted'
                }`}
              >
                {w.status}
              </span>
            </div>
            <h3 className="mt-5 font-head text-2xl font-semibold text-hero-text">{w.name}</h3>
            <p className="text-sm text-hero-muted">{w.type}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-hero-muted">
              <Icon name="ShieldCheck" size={16} className="text-primary" />
              {w.permit}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-hero-bg p-5 text-sm text-hero-muted">
        <Icon name="BellRing" size={20} className="shrink-0 text-primary" />
        Приложение напомнит о продлении разрешений за 60 дней до окончания срока.
      </div>
    </div>
  </section>
);

export default Gear;
