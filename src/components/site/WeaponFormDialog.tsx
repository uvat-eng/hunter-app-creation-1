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
import type { WeaponDto, AccessoryDto } from '@/lib/api';
import PhotoUploadSlot from './PhotoUploadSlot';

export type WeaponDraft = Omit<WeaponDto, 'id' | 'hunterId'>;

export const accessoryKeys = ['optics', 'thermal', 'collimator'] as const;

export const steps = [
  { title: 'Марка и калибр', desc: 'Как называется оружие, калибр и фото ствола' },
  { title: 'Номер разрешения', desc: 'Номер, дата выдачи и фото РОХа' },
  { title: 'Оптика', desc: 'Прицел, если установлен. Если нет — можно пропустить', icon: 'Telescope' },
  { title: 'Тепловизор', desc: 'Насадка или прицел, если есть. Если нет — можно пропустить', icon: 'Flame' },
  { title: 'Коллиматор', desc: 'Коллиматорный прицел, если есть. Если нет — можно пропустить', icon: 'ScanEye' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: number;
  draft: WeaponDraft;
  setDraft: React.Dispatch<React.SetStateAction<WeaponDraft>>;
  costInput: string;
  setCostInput: (v: string) => void;
  saving: boolean;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  onSkipAcc: (key: (typeof accessoryKeys)[number]) => void;
  onGoNext: () => void;
  setAcc: (key: (typeof accessoryKeys)[number], patch: Partial<AccessoryDto>) => void;
}

const WeaponFormDialog = ({
  open,
  onOpenChange,
  step,
  draft,
  setDraft,
  costInput,
  setCostInput,
  saving,
  onNext,
  onBack,
  onSave,
  onSkipAcc,
  onGoNext,
  setAcc,
}: Props) => {
  const isLast = step === steps.length - 1;
  const accKeyForStep = step >= 2 ? accessoryKeys[step - 2] : null;
  const accValue = accKeyForStep ? draft[accKeyForStep] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div>
              <Label htmlFor="w-cost" className="text-hero-muted">Стоимость, ₽</Label>
              <Input
                id="w-cost"
                type="number"
                inputMode="numeric"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                placeholder="35000"
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
              onClick={onBack}
              className="rounded-sm border border-border px-4 py-3 text-hero-muted transition-colors hover:text-hero-text"
            >
              <Icon name="ArrowLeft" size={18} />
            </button>
          )}

          {accKeyForStep && (
            <button
              onClick={() => onSkipAcc(accKeyForStep)}
              disabled={saving}
              className="flex-1 rounded-sm border border-border py-3 text-sm text-hero-muted transition-colors hover:border-primary/50 hover:text-hero-text disabled:opacity-60"
            >
              Отсутствует
            </button>
          )}

          {isLast ? (
            <button
              onClick={onSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? 'Сохраняем…' : 'Сохранить'} <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
            </button>
          ) : (
            <button
              onClick={() => (accKeyForStep ? onGoNext() : onNext())}
              className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {accKeyForStep && accValue?.name ? 'Добавить и далее' : 'Далее'} <Icon name="ArrowRight" size={18} />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeaponFormDialog;
