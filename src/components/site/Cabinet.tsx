import { Link } from 'react-router-dom';
import type { HunterProfile } from './HunterOnboarding';
import type { HuntEventDto } from '@/lib/api';
import Icon from '@/components/ui/icon';

const routes = [
  { icon: 'CalendarDays', label: 'Календарь охот', href: '/calendar', desc: 'планы и завершённые охоты' },
  { icon: 'BookOpen', label: 'Дневник охот', href: '/hunts', desc: 'история выездов и трофеи' },
  { icon: 'Target', label: 'Моё оружие', href: '/gear', desc: 'учёт стволов и разрешений' },
  { icon: 'Map', label: 'Карта охот', href: '/map', desc: 'точки выездов на карте' },
];

interface Props {
  profile: HunterProfile | null;
  events?: HuntEventDto[];
  weaponsCount?: number;
  onStart: () => void;
}

const Cabinet = ({ profile, events = [], weaponsCount = 0, onStart }: Props) => {
  const name = profile?.name || 'Иван Малышев';
  const city = profile?.city || 'Тюмень';
  const ticket = profile?.ticket || '№ 72 004518';
  const ticketDate = profile?.ticketDate
    ? new Date(profile.ticketDate).toLocaleDateString('ru')
    : '14.03.2019';
  const photo = profile?.photo;

  const huntsCount = events.length;
  const trophiesCount = events.reduce(
    (sum, ev) => sum + ev.trophies.reduce((s, t) => s + (parseInt(t.count, 10) || 1), 0),
    0,
  );
  const experience = profile?.experience || '0';

  const stats = [
    { value: String(huntsCount), label: 'выездов' },
    { value: String(trophiesCount), label: 'трофея' },
    { value: experience, label: 'лет стажа' },
    { value: String(weaponsCount), label: 'ствола' },
  ];

  return (
    <section id="cabinet" className="relative border-t border-border bg-hero-bg py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        {/* карточка охотника — портфолио */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-stretch">
          <div className="animate-fade-in overflow-hidden rounded-lg border border-border bg-gradient-to-br from-hero-surface to-hero-bg p-8 md:p-10">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-1 ring-primary/40">
                {photo ? (
                  <img src={photo} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-head text-3xl font-bold text-primary">
                    {name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-hero-accent">
                  Карточка охотника
                </span>
                <h3 className="font-head text-3xl font-bold tracking-tight text-hero-text">
                  {name}
                </h3>
                <p className="text-hero-muted">{city}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 rounded-sm border border-border bg-hero-bg/50 px-4 py-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-hero-muted">Охотбилет</div>
                <div className="font-medium text-hero-text">{ticket}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-hero-muted">Дата выдачи</div>
                <div className="font-medium text-hero-text">{ticketDate}</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-3 border-t border-border pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-head text-2xl font-bold text-hero-text md:text-3xl">
                    {s.value}
                  </div>
                  <div className="text-xs text-hero-muted">{s.label}</div>
                </div>
              ))}
            </div>

            {!profile && (
              <button
                onClick={onStart}
                className="mt-8 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Заполнить свою анкету <Icon name="ArrowRight" size={16} />
              </button>
            )}
          </div>

          {/* маршруты кабинета */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {routes.map((r) => (
              <Link
                key={r.label}
                to={r.href}
                className="group flex flex-col justify-between rounded-lg border border-border bg-hero-surface p-5 transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon name={r.icon} size={22} />
                </span>
                <div className="mt-6">
                  <div className="font-head text-lg font-semibold leading-tight text-hero-text">
                    {r.label}
                  </div>
                  <div className="mt-1 text-xs text-hero-muted">{r.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cabinet;