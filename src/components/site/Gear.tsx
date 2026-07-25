import { useState } from 'react';
import SectionHeading from './SectionHeading';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Weapon {
  name: string;
  type: string;
  rokha: string;
  rokhaDate: string;
  status: string;
  icon: string;
}

interface Equip {
  id: string;
  name: string;
  params: string;
}

const weapons: Weapon[] = [
  {
    name: 'МР-155',
    type: 'Гладкоствольное · 12×76',
    rokha: 'РОХа № 1234567',
    rokhaDate: '18.05.2022',
    status: 'Активно',
    icon: 'Target',
  },
  {
    name: 'Тигр (СВД)',
    type: 'Нарезное · 7.62×54',
    rokha: 'РОХа № 7654321',
    rokhaDate: '02.11.2021',
    status: 'Активно',
    icon: 'Crosshair',
  },
  {
    name: 'ИЖ-27',
    type: 'Гладкоствольное · 12×70',
    rokha: 'На хранении',
    rokhaDate: '09.03.2020',
    status: 'В сейфе',
    icon: 'Archive',
  },
];

const equipCategories = [
  {
    id: 'optics',
    title: 'Оптика',
    icon: 'Telescope',
    placeholderName: 'Напр.: Leupold VX-3i',
    placeholderParams: 'Кратность 3.5-10×40, сетка Duplex',
    items: [{ id: 'o1', name: 'Leupold VX-3i', params: '3.5-10×40, сетка Duplex' }] as Equip[],
  },
  {
    id: 'thermal',
    title: 'Тепловизор',
    icon: 'Flame',
    placeholderName: 'Напр.: Pulsar Thermion 2',
    placeholderParams: 'Матрица 640×480, дальность 1800 м',
    items: [{ id: 't1', name: 'Pulsar Thermion 2', params: '640×480, дальность 1800 м' }] as Equip[],
  },
  {
    id: 'collimator',
    title: 'Коллиматор',
    icon: 'ScanEye',
    placeholderName: 'Напр.: Aimpoint Micro H-2',
    placeholderParams: 'Точка 2 MOA, ресурс 50 000 ч',
    items: [{ id: 'c1', name: 'Aimpoint Micro H-2', params: '2 MOA, ресурс 50 000 ч' }] as Equip[],
  },
];

const Gear = () => {
  const [categories, setCategories] = useState(equipCategories);
  const [addTo, setAddTo] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', params: '' });

  const activeCat = categories.find((c) => c.id === addTo);

  const openAdd = (id: string) => {
    setAddTo(id);
    setDraft({ name: '', params: '' });
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast({ title: 'Укажите название', description: 'Название нужно для внесения в учёт.' });
      return;
    }
    setCategories((cats) =>
      cats.map((c) =>
        c.id === addTo
          ? { ...c, items: [...c.items, { id: crypto.randomUUID(), name: draft.name, params: draft.params }] }
          : c,
      ),
    );
    toast({ title: 'Добавлено в учёт', description: draft.name });
    setAddTo(null);
  };

  return (
    <section id="gear" className="border-t border-border bg-hero-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Моё оружие и снаряжение"
          title="Оружейный сейф"
          description="Учёт стволов, номера РОХ и сроки разрешений, а также оптика, тепловизоры и коллиматоры — всё под контролем."
        />

        {/* Оружие */}
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
                    w.status === 'Активно' ? 'bg-primary/15 text-primary' : 'bg-secondary text-hero-muted'
                  }`}
                >
                  {w.status}
                </span>
              </div>
              <h3 className="mt-5 font-head text-2xl font-semibold text-hero-text">{w.name}</h3>
              <p className="text-sm text-hero-muted">{w.type}</p>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm text-hero-muted">
                <div className="flex items-center gap-2">
                  <Icon name="ShieldCheck" size={16} className="shrink-0 text-primary" />
                  {w.rokha}
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CalendarClock" size={16} className="shrink-0 text-primary" />
                  Выдана {w.rokhaDate}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Снаряжение: оптика, тепловизор, коллиматор */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-lg border border-border bg-hero-bg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary/12 text-primary">
                    <Icon name={cat.icon} size={22} />
                  </span>
                  <h3 className="font-head text-xl font-semibold text-hero-text">{cat.title}</h3>
                </div>
                <button
                  onClick={() => openAdd(cat.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
                  aria-label={`Добавить: ${cat.title}`}
                >
                  <Icon name="Plus" size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {cat.items.length === 0 && (
                  <p className="text-sm text-hero-muted">Пока не добавлено. Нажмите «+».</p>
                )}
                {cat.items.map((it) => (
                  <div key={it.id} className="rounded-sm border border-border bg-hero-surface/50 px-4 py-3">
                    <div className="font-medium text-hero-text">{it.name}</div>
                    {it.params && <div className="mt-0.5 text-sm text-hero-muted">{it.params}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-hero-bg p-5 text-sm text-hero-muted">
          <Icon name="BellRing" size={20} className="shrink-0 text-primary" />
          Приложение напомнит о продлении разрешений за 60 дней до окончания срока.
        </div>
      </div>

      {/* Диалог добавления снаряжения */}
      <Dialog open={!!addTo} onOpenChange={(v) => !v && setAddTo(null)}>
        <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">
              {activeCat?.title}
            </DialogTitle>
            <DialogDescription className="text-hero-muted">
              Внесите название и параметры — позиция появится в учёте
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="eq-name" className="text-hero-muted">Название</Label>
              <Input
                id="eq-name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder={activeCat?.placeholderName}
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <div>
              <Label htmlFor="eq-params" className="text-hero-muted">Параметры</Label>
              <Input
                id="eq-params"
                value={draft.params}
                onChange={(e) => setDraft((d) => ({ ...d, params: e.target.value }))}
                placeholder={activeCat?.placeholderParams}
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <button
              onClick={save}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Добавить в учёт <Icon name="Check" size={18} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gear;
