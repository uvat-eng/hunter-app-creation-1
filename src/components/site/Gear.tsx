import { useEffect, useState } from 'react';
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
import { weaponsApi, type WeaponDto, type AccessoryDto } from '@/lib/api';
import PhotoUploadSlot from './PhotoUploadSlot';
import MedicalCertificateCard from './MedicalCertificateCard';

type Draft = Omit<WeaponDto, 'id' | 'hunterId'>;

const emptyDraft = (): Draft => ({
  name: '',
  caliber: '',
  permit: '',
  permitDate: '',
  optics: null,
  thermal: null,
  collimator: null,
  photo: '',
  permitPhoto: '',
});

const steps = [
  { title: 'Марка и калибр', desc: 'Как называется оружие, калибр и фото ствола' },
  { title: 'Номер разрешения', desc: 'Номер, дата выдачи и фото РОХа' },
  { title: 'Оптика', desc: 'Прицел, если установлен. Если нет — можно пропустить', icon: 'Telescope' },
  { title: 'Тепловизор', desc: 'Насадка или прицел, если есть. Если нет — можно пропустить', icon: 'Flame' },
  { title: 'Коллиматор', desc: 'Коллиматорный прицел, если есть. Если нет — можно пропустить', icon: 'ScanEye' },
];

const accessoryKeys = ['optics', 'thermal', 'collimator'] as const;

const AccessoryRow = ({ icon, label, acc }: { icon: string; label: string; acc: AccessoryDto }) => (
  <div className="flex items-start gap-2.5">
    <Icon name={icon} size={15} className="mt-0.5 shrink-0 text-primary" />
    <div>
      <span className="text-sm font-medium text-hero-text">
        {label}: {acc.name}
      </span>
      {acc.params && <div className="text-xs text-hero-muted">{acc.params}</div>}
    </div>
  </div>
);

const Gear = ({ hunterId, onCountChange }: { hunterId?: string; onCountChange?: (n: number) => void }) => {
  const [weapons, setWeapons] = useState<WeaponDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hunterId) {
      setWeapons([]);
      return;
    }
    setLoading(true);
    weaponsApi
      .list(hunterId)
      .then(setWeapons)
      .catch(() => toast({ title: 'Не удалось загрузить оружейный сейф' }))
      .finally(() => setLoading(false));
  }, [hunterId]);

  useEffect(() => {
    onCountChange?.(weapons.length);
  }, [weapons, onCountChange]);

  const openAdd = () => {
    if (!hunterId) {
      toast({ title: 'Сначала заведите карточку охотника', description: 'Заполните анкету, чтобы вести учёт оружия.' });
      return;
    }
    setDraft(emptyDraft());
    setEditId(null);
    setStep(0);
    setOpen(true);
  };

  const openEdit = (w: WeaponDto) => {
    const { id, hunterId: _h, ...rest } = w;
    setDraft(rest);
    setEditId(id);
    setStep(0);
    setOpen(true);
  };

  const removeWeapon = async (id: string) => {
    try {
      await weaponsApi.remove(id);
      setWeapons((ws) => ws.filter((w) => w.id !== id));
      toast({ title: 'Оружие удалено из учёта' });
    } catch {
      toast({ title: 'Не удалось удалить' });
    }
  };

  const setAcc = (key: (typeof accessoryKeys)[number], patch: Partial<AccessoryDto>) => {
    setDraft((d) => ({
      ...d,
      [key]: { name: d[key]?.name || '', params: d[key]?.params || '', ...patch },
    }));
  };

  const persist = async (data: Draft) => {
    if (!hunterId) return;
    setSaving(true);
    try {
      const saved = editId
        ? await weaponsApi.update(editId, data)
        : await weaponsApi.create({ ...data, hunterId });
      setWeapons((ws) => (editId ? ws.map((w) => (w.id === editId ? saved : w)) : [saved, ...ws]));
      toast({ title: editId ? 'Изменения сохранены' : 'Оружие добавлено в учёт', description: saved.name });
      setOpen(false);
    } catch {
      toast({ title: 'Не удалось сохранить' });
    } finally {
      setSaving(false);
    }
  };

  const skipAcc = (key: (typeof accessoryKeys)[number]) => {
    const updated = { ...draft, [key]: null };
    setDraft(updated);
    if (step === steps.length - 1) {
      persist(updated);
    } else {
      goNext();
    }
  };

  const validateStep = () => {
    if (step === 0 && (!draft.name.trim() || !draft.caliber.trim())) {
      toast({ title: 'Заполните марку и калибр' });
      return false;
    }
    if (step === 1 && !draft.permit.trim()) {
      toast({ title: 'Укажите номер разрешения' });
      return false;
    }
    return true;
  };

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const next = () => {
    if (!validateStep()) return;
    goNext();
  };

  const save = () => persist(draft);

  const isLast = step === steps.length - 1;
  const accKeyForStep = step >= 2 ? accessoryKeys[step - 2] : null;
  const accValue = accKeyForStep ? draft[accKeyForStep] : null;

  return (
    <section id="gear" className="border-t border-border bg-hero-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Моё оружие и снаряжение"
          title="Оружейный сейф"
          description="Учёт стволов с фото, номера и фото разрешений РОХ, а также прикреплённая оптика, тепловизоры, коллиматоры и медицинская справка."
        />

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-hero-bg px-6 py-16 text-hero-muted">
            <Icon name="Loader2" size={20} className="animate-spin" /> Загружаем сейф…
          </div>
        ) : weapons.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-hero-bg px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Icon name="Target" size={26} />
            </span>
            <div>
              <div className="font-head text-lg font-semibold text-hero-text">Пока нет оружия в учёте</div>
              <p className="mt-1 text-sm text-hero-muted">
                {hunterId
                  ? 'Добавьте первую единицу — это займёт меньше минуты.'
                  : 'Заведите карточку охотника, чтобы начать учёт.'}
              </p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Icon name="Plus" size={18} /> Добавить оружие
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {weapons.map((w) => (
              <div
                key={w.id}
                className="group relative rounded-lg border border-border bg-hero-bg p-6 transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <div className="flex items-center justify-between">
                  {w.photo ? (
                    <img src={w.photo} alt={w.name} className="h-12 w-12 rounded-sm object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/12 text-primary">
                      <Icon name="Target" size={24} />
                    </span>
                  )}
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(w)}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
                      aria-label="Редактировать"
                    >
                      <Icon name="Pencil" size={15} />
                    </button>
                    <button
                      onClick={() => removeWeapon(w.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-destructive hover:text-destructive"
                      aria-label="Удалить"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="mt-5 font-head text-2xl font-semibold text-hero-text">{w.name}</h3>
                <p className="text-sm text-hero-muted">{w.caliber}</p>

                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm text-hero-muted">
                  <div className="flex items-center gap-2">
                    <Icon name="ShieldCheck" size={16} className="shrink-0 text-primary" />
                    {w.permit}
                    {w.permitPhoto && (
                      <a
                        href={w.permitPhoto}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 text-xs text-primary underline-offset-2 hover:underline"
                      >
                        фото
                      </a>
                    )}
                  </div>
                  {w.permitDate && (
                    <div className="flex items-center gap-2">
                      <Icon name="CalendarClock" size={16} className="shrink-0 text-primary" />
                      Выдано {w.permitDate}
                    </div>
                  )}
                </div>

                {(w.optics || w.thermal || w.collimator) && (
                  <div className="mt-4 space-y-2.5 border-t border-border pt-4">
                    {w.optics && <AccessoryRow icon="Telescope" label="Оптика" acc={w.optics} />}
                    {w.thermal && <AccessoryRow icon="Flame" label="Тепловизор" acc={w.thermal} />}
                    {w.collimator && <AccessoryRow icon="ScanEye" label="Коллиматор" acc={w.collimator} />}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={openAdd}
              className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name="Plus" size={28} />
              <span className="text-sm font-medium">Добавить оружие</span>
            </button>
          </div>
        )}

        <div className="mt-6">
          <MedicalCertificateCard hunterId={hunterId} />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-hero-bg p-5 text-sm text-hero-muted">
          <Icon name="BellRing" size={20} className="shrink-0 text-primary" />
          Приложение напомнит о продлении разрешений за 60 дней до окончания срока.
        </div>
      </div>

      {/* Мастер добавления/редактирования оружия */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">
              {steps[step].title}
            </DialogTitle>
            <DialogDescription className="text-hero-muted">{steps[step].desc}</DialogDescription>
          </DialogHeader>

          <div className="mb-1 flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="w-name" className="text-hero-muted">Марка / модель</Label>
                <Input
                  id="w-name"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="МР-155"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <div>
                <Label htmlFor="w-caliber" className="text-hero-muted">Калибр / тип</Label>
                <Input
                  id="w-caliber"
                  value={draft.caliber}
                  onChange={(e) => setDraft((d) => ({ ...d, caliber: e.target.value }))}
                  placeholder="Гладкоствольное · 12×76"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <PhotoUploadSlot
                label="Фото оружия"
                photo={draft.photo}
                onChange={(v) => setDraft((d) => ({ ...d, photo: v }))}
                icon="Target"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="w-permit" className="text-hero-muted">Номер РОХа</Label>
                  <Input
                    id="w-permit"
                    value={draft.permit}
                    onChange={(e) => setDraft((d) => ({ ...d, permit: e.target.value }))}
                    placeholder="№ 1234567"
                    className="mt-1.5 border-border bg-hero-bg"
                  />
                </div>
                <div>
                  <Label htmlFor="w-permit-date" className="text-hero-muted">Дата выдачи</Label>
                  <Input
                    id="w-permit-date"
                    type="date"
                    value={draft.permitDate}
                    onChange={(e) => setDraft((d) => ({ ...d, permitDate: e.target.value }))}
                    className="mt-1.5 border-border bg-hero-bg"
                  />
                </div>
              </div>
              <PhotoUploadSlot
                label="Фото разрешения (РОХа)"
                photo={draft.permitPhoto}
                onChange={(v) => setDraft((d) => ({ ...d, permitPhoto: v }))}
                icon="ShieldCheck"
              />
            </div>
          )}

          {accKeyForStep && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="acc-name" className="text-hero-muted">Название</Label>
                <Input
                  id="acc-name"
                  value={accValue?.name || ''}
                  onChange={(e) => setAcc(accKeyForStep, { name: e.target.value })}
                  placeholder={
                    accKeyForStep === 'optics'
                      ? 'Напр.: Leupold VX-3i'
                      : accKeyForStep === 'thermal'
                      ? 'Напр.: Pulsar Thermion 2'
                      : 'Напр.: Aimpoint Micro H-2'
                  }
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <div>
                <Label htmlFor="acc-params" className="text-hero-muted">Параметры</Label>
                <Input
                  id="acc-params"
                  value={accValue?.params || ''}
                  onChange={(e) => setAcc(accKeyForStep, { params: e.target.value })}
                  placeholder={
                    accKeyForStep === 'optics'
                      ? '3.5-10×40, сетка Duplex'
                      : accKeyForStep === 'thermal'
                      ? '640×480, дальность 1800 м'
                      : '2 MOA, ресурс 50 000 ч'
                  }
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {step > 0 && (
              <button
                onClick={goBack}
                className="rounded-sm border border-border px-4 py-3 text-hero-muted transition-colors hover:text-hero-text"
              >
                <Icon name="ArrowLeft" size={18} />
              </button>
            )}

            {accKeyForStep && (
              <button
                onClick={() => skipAcc(accKeyForStep)}
                disabled={saving}
                className="flex-1 rounded-sm border border-border py-3 text-sm text-hero-muted transition-colors hover:border-primary/50 hover:text-hero-text disabled:opacity-60"
              >
                Отсутствует
              </button>
            )}

            {isLast ? (
              <button
                onClick={save}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {saving ? 'Сохраняем…' : 'Сохранить'} <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
              </button>
            ) : (
              <button
                onClick={() => (accKeyForStep ? goNext() : next())}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                {accKeyForStep && accValue?.name ? 'Добавить и далее' : 'Далее'} <Icon name="ArrowRight" size={18} />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gear;