import { useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const gallery = [
  'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/92510a96-e63e-4bfd-9aed-55c2f6f0ed2e.jpg',
  'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/bb3a3565-7961-4e3d-bb3e-4c82ab4e34b3.jpg',
  'https://cdn.poehali.dev/projects/5f7ac438-464f-49d1-a914-76a5b9375da3/files/ec998433-a70e-4c4e-bf3f-157b056ed6ee.jpg',
];

const facts = [
  { icon: 'Trees', label: 'Площадь угодий', value: '24 000 га' },
  { icon: 'Home', label: 'Гостевые дома', value: '4 дома · 18 мест' },
  { icon: 'Users', label: 'Егеря', value: '6 сопровождающих' },
  { icon: 'PawPrint', label: 'Виды дичи', value: 'лось, кабан, перо' },
];

const Estate = ({ onBook }: { onBook: () => void }) => {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="estate" className="border-t border-border bg-hero-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Охотхозяйство"
          title="Малышенское угодье"
          description="Заповедные леса и озёра Западной Сибири. Организованная охота с егерями, размещение в тёплых домах и полное сопровождение — от лицензии до трофея."
        />

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <button
            onClick={() => setActive(gallery[0])}
            className="group relative h-72 overflow-hidden rounded-lg md:h-[26rem]"
          >
            <img
              src={gallery[0]}
              alt="Угодья Малышенского"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-hero-bg/70 to-transparent" />
            <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-sm bg-hero-bg/70 px-3 py-1.5 text-sm text-hero-text backdrop-blur">
              <Icon name="Maximize2" size={15} /> Открыть галерею
            </span>
          </button>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            {gallery.slice(1).map((src) => (
              <button
                key={src}
                onClick={() => setActive(src)}
                className="group relative h-40 overflow-hidden rounded-lg lg:h-[12.5rem]"
              >
                <img
                  src={src}
                  alt="Фото хозяйства"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-hero-bg/20 transition-colors group-hover:bg-hero-bg/0" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="rounded-lg border border-border bg-hero-bg p-5">
              <Icon name={f.icon} size={22} className="text-primary" />
              <div className="mt-3 font-head text-lg font-semibold text-hero-text">{f.value}</div>
              <div className="text-xs text-hero-muted">{f.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-6 md:flex-row md:items-center md:p-8">
          <div>
            <div className="font-head text-xl font-semibold text-hero-text">Готовы в угодья?</div>
            <p className="text-hero-muted">Забронируйте даты и пакет тура онлайн — егерь подтвердит выезд.</p>
          </div>
          <button
            onClick={onBook}
            className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-primary px-7 py-4 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Забронировать охоту <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent className="max-w-4xl border-border bg-hero-bg p-2">
          {active && (
            <img src={active} alt="Фото хозяйства" className="max-h-[80vh] w-full rounded-md object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Estate;
