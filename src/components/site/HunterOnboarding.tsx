import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { huntersApi } from '@/lib/api';

export interface HunterProfile {
  id?: string;
  name: string;
  city: string;
  ticket: string;
  ticketDate: string;
  photo: string;
  experience: string;
  weapon: string;
  game: string;
}

const games = ['Перо', 'Копытные', 'Пушнина', 'Заяц', 'Кабан', 'Лось'];

const HunterOnboarding = ({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (p: HunterProfile) => void;
}) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<HunterProfile>({
    name: '',
    city: '',
    ticket: '',
    ticketDate: '',
    photo: '',
    experience: '',
    weapon: '',
    game: 'Перо',
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const set = (k: keyof HunterProfile, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('photo', String(reader.result));
    reader.readAsDataURL(file);
  };

  const validateStep0 = () => {
    const e = {
      name: !form.name.trim(),
      city: !form.city.trim(),
    };
    setErrors(e);
    return !e.name && !e.city;
  };

  const next = () => {
    if (validateStep0()) setStep(1);
  };

  const finish = async () => {
    if (!form.ticket.trim()) {
      setErrors({ ticket: true });
      return;
    }
    setSaving(true);
    try {
      const created = await huntersApi.create(form);
      const saved: HunterProfile = {
        ...form,
        id: created.id,
        ticketDate: created.ticket_date || form.ticketDate,
        photo: created.photo || form.photo,
      };
      toast({ title: 'Анкета сохранена', description: 'Личный кабинет открыт ниже.' });
      onComplete(saved);
      onOpenChange(false);
      setStep(0);
      setTimeout(() => {
        document.getElementById('cabinet')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch {
      toast({ title: 'Не удалось сохранить анкету', description: 'Попробуйте ещё раз.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
        <DialogHeader>
          <DialogTitle className="font-head text-2xl font-bold tracking-tight">
            {step === 0 ? 'Вход охотника' : 'Анкета охотника'}
          </DialogTitle>
          <DialogDescription className="text-hero-muted">
            {step === 0
              ? 'Малышенское — заведите карточку за 2 минуты'
              : 'Заполните данные — и откроется личный кабинет'}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex gap-2">
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-hero-bg transition-colors hover:border-primary">
                {form.photo ? (
                  <img src={form.photo} alt="Фото охотника" className="h-full w-full object-cover" />
                ) : (
                  <Icon name="Camera" size={22} className="text-hero-muted transition-colors group-hover:text-primary" />
                )}
                <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
              </label>
              <div className="text-sm text-hero-muted">
                Фото охотника
                <div className="text-xs">Нажмите на кружок, чтобы загрузить</div>
              </div>
            </div>
            <div>
              <Label htmlFor="name" className="text-hero-muted">Имя и фамилия</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Иван Малышев"
                className={`mt-1.5 border-border bg-hero-bg ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">Укажите имя</p>}
            </div>
            <div>
              <Label htmlFor="city" className="text-hero-muted">Город</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Тюмень"
                className={`mt-1.5 border-border bg-hero-bg ${errors.city ? 'border-destructive' : ''}`}
              />
              {errors.city && <p className="mt-1 text-xs text-destructive">Укажите город</p>}
            </div>
            <button
              onClick={next}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Далее <Icon name="ArrowRight" size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ticket" className="text-hero-muted">Охотничий билет</Label>
                <Input
                  id="ticket"
                  value={form.ticket}
                  onChange={(e) => set('ticket', e.target.value)}
                  placeholder="№ 72 000000"
                  className={`mt-1.5 border-border bg-hero-bg ${errors.ticket ? 'border-destructive' : ''}`}
                />
                {errors.ticket && <p className="mt-1 text-xs text-destructive">Укажите номер</p>}
              </div>
              <div>
                <Label htmlFor="ticketDate" className="text-hero-muted">Дата выдачи</Label>
                <Input
                  id="ticketDate"
                  type="date"
                  value={form.ticketDate}
                  onChange={(e) => set('ticketDate', e.target.value)}
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="exp" className="text-hero-muted">Стаж, лет</Label>
                <Input
                  id="exp"
                  value={form.experience}
                  onChange={(e) => set('experience', e.target.value)}
                  placeholder="7"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
              <div>
                <Label htmlFor="weapon" className="text-hero-muted">Оружие</Label>
                <Input
                  id="weapon"
                  value={form.weapon}
                  onChange={(e) => set('weapon', e.target.value)}
                  placeholder="МР-155"
                  className="mt-1.5 border-border bg-hero-bg"
                />
              </div>
            </div>
            <div>
              <Label className="text-hero-muted">Любимая дичь</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {games.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('game', g)}
                    className={`rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                      form.game === g
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-hero-muted hover:border-primary/50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setStep(0)}
                className="rounded-sm border border-border px-4 py-3 text-hero-muted transition-colors hover:text-hero-text"
              >
                <Icon name="ArrowLeft" size={18} />
              </button>
              <button
                onClick={finish}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {saving ? 'Сохраняем…' : 'Открыть кабинет'} <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HunterOnboarding;