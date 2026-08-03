import { useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import { toast } from '@/hooks/use-toast';
import { weaponsApi, type WeaponDto, type AccessoryDto } from '@/lib/api';
import WeaponsGrid from './WeaponsGrid';
import WeaponFormDialog, { accessoryKeys, steps, type WeaponDraft } from './WeaponFormDialog';
import HunterDocumentsSection from './HunterDocumentsSection';

const emptyDraft = (): WeaponDraft => ({
  name: '',
  caliber: '',
  permit: '',
  permitDate: '',
  optics: null,
  thermal: null,
  collimator: null,
  photo: '',
  permitPhoto: '',
  cost: null,
});

const Gear = ({ hunterId, onCountChange }: { hunterId?: string; onCountChange?: (n: number) => void }) => {
  const [weapons, setWeapons] = useState<WeaponDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WeaponDraft>(emptyDraft());
  const [costInput, setCostInput] = useState('');
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
    setCostInput('');
    setEditId(null);
    setStep(0);
    setOpen(true);
  };

  const openEdit = (w: WeaponDto) => {
    const { id, hunterId: _h, ...rest } = w;
    setDraft(rest);
    setCostInput(w.cost !== null && w.cost !== undefined ? String(w.cost) : '');
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

  const persist = async (data: WeaponDraft) => {
    if (!hunterId) return;
    setSaving(true);
    try {
      const payload = { ...data, cost: costInput.trim() === '' ? null : Number(costInput) };
      const saved = editId
        ? await weaponsApi.update(editId, payload)
        : await weaponsApi.create({ ...payload, hunterId });
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

  return (
    <section id="gear" className="border-t border-border bg-hero-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Моё оружие и снаряжение"
          title="Оружейный сейф"
          description="Учёт стволов с фото, номера и фото разрешений РОХ, а также прикреплённая оптика, тепловизоры, коллиматоры и медицинская справка."
        />

        <WeaponsGrid
          weapons={weapons}
          loading={loading}
          hunterId={hunterId}
          onAdd={openAdd}
          onEdit={openEdit}
          onRemove={removeWeapon}
        />

        <HunterDocumentsSection hunterId={hunterId} />
      </div>

      <WeaponFormDialog
        open={open}
        onOpenChange={setOpen}
        step={step}
        draft={draft}
        setDraft={setDraft}
        costInput={costInput}
        setCostInput={setCostInput}
        saving={saving}
        onNext={next}
        onBack={goBack}
        onSave={save}
        onSkipAcc={skipAcc}
        onGoNext={goNext}
        setAcc={setAcc}
      />
    </section>
  );
};

export default Gear;
