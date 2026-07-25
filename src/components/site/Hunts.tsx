import { useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';

const hunts = [
  { date: '02.10.2024', place: 'Озёрный сектор', game: 'Кряква', result: '4 трофея', tag: 'Перо', budget: '9 400 ₽' },
  { date: '21.09.2024', place: 'Северный обход', game: 'Гусь', result: '2 трофея', tag: 'Перо', budget: '11 200 ₽' },
  { date: '14.09.2024', place: 'Кедровая падь', game: 'Кабан', result: 'Трофей 92 кг', tag: 'Копытные', budget: '28 000 ₽' },
  { date: '31.08.2024', place: 'Луговой участок', game: 'Тетерев', result: '5 трофеев', tag: 'Перо', budget: '7 600 ₽' },
];

const tags = ['Все', 'Перо', 'Копытные'];

const Hunts = () => {
  const [filter, setFilter] = useState('Все');
  const rows = filter === 'Все' ? hunts : hunts.filter((h) => h.tag === filter);

  return (
    <section id="hunts" className="border-t border-border bg-hero-bg py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Мои охоты и трофеи"
          title="Дневник выездов"
          description="Каждый выезд — в учёте: дата, место, добыча и расходы. Ведите статистику сезона за сезоном."
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-sm border px-4 py-2 text-sm transition-colors ${
                filter === t
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-hero-muted hover:border-primary/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden grid-cols-[1fr_1.4fr_1fr_1.2fr_1fr] gap-4 border-b border-border bg-hero-surface px-6 py-4 text-xs uppercase tracking-wide text-hero-muted md:grid">
            <span>Дата</span>
            <span>Место</span>
            <span>Дичь</span>
            <span>Результат</span>
            <span className="text-right">Бюджет</span>
          </div>
          {rows.map((h, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-3 border-b border-border bg-hero-surface/50 px-6 py-4 text-sm transition-colors last:border-0 hover:bg-hero-surface md:grid-cols-[1fr_1.4fr_1fr_1.2fr_1fr] md:gap-4"
            >
              <span className="font-medium text-hero-text">{h.date}</span>
              <span className="flex items-center gap-2 text-hero-muted">
                <Icon name="MapPin" size={15} className="text-primary" />
                {h.place}
              </span>
              <span className="text-hero-muted">{h.game}</span>
              <span className="flex items-center gap-2 text-hero-text">
                <Icon name="Award" size={15} className="text-primary" />
                {h.result}
              </span>
              <span className="text-right font-medium text-hero-text md:text-right">{h.budget}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hunts;
