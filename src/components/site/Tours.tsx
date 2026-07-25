import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';

const tours = [
  {
    name: 'Охота по перу',
    price: '8 500',
    unit: '₽ / день',
    badge: 'Сезон открыт',
    icon: 'Bird',
    features: ['Утка, гусь, тетерев', 'Егерь и легавая', 'Скрадки на воде', 'Разделка трофея'],
    highlight: false,
  },
  {
    name: 'Загонная на копытных',
    price: '32 000',
    unit: '₽ / тур',
    badge: 'Хит сезона',
    icon: 'Crosshair',
    features: ['Лось, кабан', 'Загон с егерями', 'Вышки и номера', 'Проживание 2 ночи', 'Трофейная обработка'],
    highlight: true,
  },
  {
    name: 'Трофейный выезд',
    price: '54 000',
    unit: '₽ / тур',
    badge: 'Премиум',
    icon: 'Award',
    features: ['Индивидуальный егерь', 'Транспорт по угодьям', 'Дом класса «люкс»', 'Фотоохота и съёмка', 'Медаль CIC'],
    highlight: false,
  },
];

const Tours = ({ onBook }: { onBook: () => void }) => (
  <section id="tours" className="border-t border-border bg-hero-bg py-20 md:py-28">
    <div className="mx-auto max-w-7xl px-5 md:px-10">
      <SectionHeading
        eyebrow="Пакеты туров"
        title="Выберите свою охоту"
        description="Готовые программы с сопровождением, размещением и обработкой трофея. Цена фиксируется при бронировании."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {tours.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-lg border p-7 transition-all hover:-translate-y-1 ${
              t.highlight
                ? 'border-primary bg-gradient-to-b from-primary/12 to-hero-surface'
                : 'border-border bg-hero-surface'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary/15 text-primary">
                <Icon name={t.icon} size={22} />
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  t.highlight ? 'bg-primary text-primary-foreground' : 'bg-secondary text-hero-muted'
                }`}
              >
                {t.badge}
              </span>
            </div>

            <h3 className="mt-6 font-head text-2xl font-semibold text-hero-text">{t.name}</h3>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-head text-4xl font-bold text-hero-text">{t.price}</span>
              <span className="text-sm text-hero-muted">{t.unit}</span>
            </div>

            <ul className="mt-6 space-y-3 border-t border-border pt-6">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-hero-muted">
                  <Icon name="Check" size={16} className="shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={onBook}
              className={`mt-7 rounded-sm py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 ${
                t.highlight
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-primary/40 text-hero-text hover:border-primary'
              }`}
            >
              Забронировать
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Tours;
