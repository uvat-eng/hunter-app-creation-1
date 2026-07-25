import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';

const huntTypes = [
  {
    title: 'Охота по перу',
    icon: 'Bird',
    season: 'Авг – Ноя',
    desc: 'Утка, гусь и тетерев на воде и полях с егерем и легавой',
    game: ['Утка', 'Гусь', 'Тетерев'],
  },
  {
    title: 'Загонная на копытных',
    icon: 'Crosshair',
    season: 'Окт – Янв',
    desc: 'Лось, кабан и косуля — загон с несколькими егерями и вышек',
    game: ['Лось', 'Кабан', 'Косуля'],
  },
  {
    title: 'Вольерная охота',
    icon: 'Fence',
    season: 'Круглый год',
    desc: 'Кабан и косуля в вольерных угодьях — доступно в любой сезон',
    game: ['Кабан', 'Косуля'],
  },
  {
    title: 'Трофейная охота',
    icon: 'Award',
    season: 'По записи',
    desc: 'Индивидуальный егерь и транспорт — охота на трофейный экземпляр',
    game: ['Лось', 'Кабан'],
  },
];

const HuntChoice = ({ onPick }: { onPick: () => void }) => (
  <section id="hunt-choice" className="border-t border-border bg-hero-surface py-20 md:py-28">
    <div className="mx-auto max-w-7xl px-5 md:px-10">
      <SectionHeading
        eyebrow="Выбор охоты"
        title="Какая охота вам ближе?"
        description="Определитесь с видом охоты — дальше подберём подходящий пакет тура с ценой и условиями."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {huntTypes.map((h) => (
          <div
            key={h.title}
            className="flex flex-col rounded-lg border border-border bg-hero-bg p-6 transition-all hover:-translate-y-1 hover:border-primary/50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/15 text-primary">
              <Icon name={h.icon} size={24} />
            </span>
            <h3 className="mt-5 font-head text-xl font-semibold text-hero-text">{h.title}</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-hero-accent">{h.season}</p>
            <p className="mt-3 text-sm leading-relaxed text-hero-muted">{h.desc}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {h.game.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-hero-muted"
                >
                  {g}
                </span>
              ))}
            </div>

            <button
              onClick={onPick}
              className="mt-6 flex items-center justify-center gap-2 rounded-sm border border-primary/40 py-2.5 text-sm font-bold text-hero-text transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              Подобрать тур <Icon name="ArrowRight" size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HuntChoice;
