import { useMemo, useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

const services = [
  { id: 'lodge', label: 'Проживание в доме', price: 3500 },
  { id: 'jaeger', label: 'Сопровождение егеря', price: 4000 },
  { id: 'transport', label: 'Транспорт по угодьям', price: 2500 },
  { id: 'trophy', label: 'Обработка трофея', price: 3000 },
  { id: 'meal', label: 'Питание', price: 1500 },
];

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const months = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

// заранее «занятые» дни для реалистичности
const busy = [5, 6, 12, 19, 20];

const Booking = () => {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<number | null>(null);
  const [chosen, setChosen] = useState<string[]>(['jaeger']);

  const days = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const start = (first.getDay() + 6) % 7; // пн = 0
    const total = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (number | null)[] = Array(start).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [view]);

  const shift = (dir: number) => {
    setSelected(null);
    setView((v) => {
      const m = v.m + dir;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { ...v, m };
    });
  };

  const toggle = (id: string) =>
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const total = chosen.reduce((s, id) => s + (services.find((x) => x.id === id)?.price || 0), 0);

  const submit = () => {
    if (!selected) {
      toast({ title: 'Выберите дату', description: 'Отметьте день выезда в календаре.' });
      return;
    }
    toast({
      title: 'Заявка на бронь принята',
      description: `${selected} ${months[view.m].toLowerCase()} · ${total.toLocaleString('ru')} ₽. Егерь свяжется с вами.`,
    });
  };

  return (
    <section id="booking" className="border-t border-border bg-hero-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Онлайн-бронирование"
          title="Календарь выездов"
          description="Выберите дату, отметьте нужные услуги — стоимость посчитается сразу. Егерь подтвердит бронь."
        />

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* календарь */}
          <div className="rounded-lg border border-border bg-hero-bg p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-head text-xl font-semibold text-hero-text">
                {months[view.m]} {view.y}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => shift(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-hero-text"
                >
                  <Icon name="ChevronLeft" size={18} />
                </button>
                <button
                  onClick={() => shift(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-hero-text"
                >
                  <Icon name="ChevronRight" size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {weekdays.map((w) => (
                <div key={w} className="pb-2 text-center text-xs uppercase tracking-wide text-hero-muted">
                  {w}
                </div>
              ))}
              {days.map((d, i) => {
                if (d === null) return <div key={i} />;
                const isBusy = busy.includes(d);
                const isSel = selected === d;
                return (
                  <button
                    key={i}
                    disabled={isBusy}
                    onClick={() => setSelected(d)}
                    className={`aspect-square rounded-sm text-sm font-medium transition-all ${
                      isSel
                        ? 'bg-primary text-primary-foreground'
                        : isBusy
                        ? 'cursor-not-allowed bg-secondary/40 text-hero-muted/40 line-through'
                        : 'text-hero-text hover:bg-primary/20'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-xs text-hero-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-primary" /> выбрано
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-secondary/60" /> занято
              </span>
            </div>
          </div>

          {/* услуги + итог */}
          <div className="flex flex-col rounded-lg border border-border bg-hero-bg p-6 md:p-8">
            <div className="font-head text-lg font-semibold text-hero-text">Услуги брони</div>
            <div className="mt-4 space-y-2">
              {services.map((s) => {
                const on = chosen.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`flex w-full items-center justify-between rounded-sm border px-4 py-3 text-left transition-colors ${
                      on ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-sm border ${
                          on ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}
                      >
                        {on && <Icon name="Check" size={13} />}
                      </span>
                      <span className="text-sm text-hero-text">{s.label}</span>
                    </span>
                    <span className="text-sm text-hero-muted">{s.price.toLocaleString('ru')} ₽</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-border pt-5">
              <span className="text-hero-muted">Итого за день</span>
              <span className="font-head text-3xl font-bold text-hero-text">
                {total.toLocaleString('ru')} ₽
              </span>
            </div>
            <p className="mt-1 text-sm text-hero-muted">
              {selected
                ? `Выезд: ${selected} ${months[view.m].toLowerCase()}`
                : 'Дата не выбрана'}
            </p>

            <button
              onClick={submit}
              className="mt-6 flex items-center justify-center gap-2 rounded-sm bg-primary py-4 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Забронировать <Icon name="CalendarCheck" size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Booking;
