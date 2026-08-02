import { useEffect, useState } from 'react';
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
import { accessoryItemsApi, type AccessoryItemDto, type AccessoryItemType } from '@/lib/api';
import PhotoUploadSlot from './PhotoUploadSlot';

type Draft = Omit<AccessoryItemDto, 'id' | 'hunterId'>;

const emptyDraft = (): Draft => ({ type: 'binoculars', name: '', params: '', photo: '', cost: null });

const typeOptions: { value: AccessoryItemType; label: string; icon: string; placeholder: string }[] = [
  { value: 'binoculars', label: 'Бинокль', icon: 'Binoculars', placeholder: 'Напр.: Nikon Aculon 10x42' },
  { value: 'thermal_device', label: 'Тепловизионный прибор', icon: 'Flame', placeholder: 'Напр.: Pulsar Helion 2 XP50' },
  { value: 'other', label: 'Другое', icon: 'Package', placeholder: 'Название прибора' },
];

const formatMoney = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const AccessoryItems = ({ hunterId }: { hunterId?: string }) => {
  const [items, setItems] = useState<AccessoryItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [costInput, setCostInput] = useState('');

  useEffect(() => {
    if (!hunterId) {
      setItems([]);
      return;
    }
    setLoading(true);
    accessoryItemsApi
      .list(hunterId)
      .then(setItems)
      .catch(() => toast({ title: 'Не удалось загрузить оружейные аксессуары' }))
      .finally(() => setLoading(false));
  }, [hunterId]);

  const openAdd = () => {
    if (!hunterId) {
      toast({ title: 'Сначала заведите карточку охотника' });
      return;
    }
    setDraft(emptyDraft());
    setCostInput('');
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (item: AccessoryItemDto) => {
    const { id, hunterId: _h, ...rest } = item;
    setDraft(rest);
    setCostInput(item.cost !== null ? String(item.cost) : '');
    setEditId(id);
    setOpen(true);
  };

  const remove = async (id: string) => {
    try {
      await accessoryItemsApi.remove(id);
      setItems((list) => list.filter((i) => i.id !== id));
      toast({ title: 'Прибор удалён' });
    } catch {
      toast({ title: 'Не удалось удалить' });
    }
  };

  const save = async () => {
    if (!hunterId || !draft.name.trim()) {
      toast({ title: 'Укажите название прибора' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...draft, cost: costInput.trim() === '' ? null : Number(costInput) };
      const saved = editId
        ? await accessoryItemsApi.update(editId, payload)
        : await accessoryItemsApi.create({ ...payload, hunterId });
      setItems((list) => (editId ? list.map((i) => (i.id === editId ? saved : i)) : [saved, ...list]));
      toast({ title: editId ? 'Изменения сохранены' : 'Прибор добавлен', description: saved.name });
      setOpen(false);
    } catch {
      toast({ title: 'Не удалось сохранить' });
    } finally {
      setSaving(false);
    }
  };

  const totalCost = items.reduce((sum, i) => sum + (i.cost || 0), 0);
  const typeMeta = (t: AccessoryItemType) => typeOptions.find((o) => o.value === t) || typeOptions[2];

  return (
    <div className="mt-16">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-hero-accent" />
        <span className="text-xs uppercase tracking-[0.22em] text-hero-accent">Дополнительное снаряжение</span>
      </div>
      <h3 className="font-head text-2xl font-bold tracking-tight text-hero-text sm:text-3xl">Оружейные аксессуары</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-hero-muted md:text-base">
        Бинокли, тепловизионные приборы наблюдения и другое снаряжение — отдельно от оружия, с фото и стоимостью.
      </p>

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-hero-bg px-6 py-16 text-hero-muted">
            <Icon name="Loader2" size={20} className="animate-spin" /> Загружаем…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-hero-bg px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Icon name="Binoculars" size={26} />
            </span>
            <div>
              <div className="font-head text-lg font-semibold text-hero-text">Аксессуаров пока нет</div>
              <p className="mt-1 text-sm text-hero-muted">
                {hunterId ? 'Добавьте бинокль, тепловизор или другой прибор.' : 'Заведите карточку охотника, чтобы начать учёт.'}
              </p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Icon name="Plus" size={18} /> Добавить прибор
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((item) => {
              const meta = typeMeta(item.type);
              return (
                <div
                  key={item.id}
                  className="group relative rounded-lg border border-border bg-hero-bg p-6 transition-all hover:-translate-y-1 hover:border-primary/50"
                >
                  <div className="flex items-center justify-between">
                    {item.photo ? (
                      <img src={item.photo} alt={item.name} className="h-12 w-12 rounded-sm object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/12 text-primary">
                        <Icon name={meta.icon} size={22} />
                      </span>
                    )}
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
                        aria-label="Редактировать"
                      >
                        <Icon name="Pencil" size={15} />
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-hero-muted transition-colors hover:border-destructive hover:text-destructive"
                        aria-label="Удалить"
                      >
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-xs uppercase tracking-wide text-hero-muted">{meta.label}</div>
                  <h4 className="mt-1 font-head text-xl font-semibold text-hero-text">{item.name}</h4>
                  {item.params && <p className="mt-1 text-sm text-hero-muted">{item.params}</p>}

                  {item.cost !== null && (
                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-primary">
                      <Icon name="Wallet" size={16} className="shrink-0" />
                      {formatMoney(item.cost)}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={openAdd}
              className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-hero-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name="Plus" size={28} />
              <span className="text-sm font-medium">Добавить прибор</span>
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 p-5">
            <div className="text-sm font-medium text-hero-text">Общая стоимость аксессуаров</div>
            <div className="font-head text-2xl font-bold text-primary">{formatMoney(totalCost)}</div>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">
              {editId ? 'Редактировать прибор' : 'Новый прибор'}
            </DialogTitle>
            <DialogDescription className="text-hero-muted">
              Бинокль, тепловизионный прибор или другое снаряжение
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-hero-muted">Тип прибора</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {typeOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, type: o.value }))}
                    className={`flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                      draft.type === o.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-hero-muted hover:border-primary/50'
                    }`}
                  >
                    <Icon name={o.icon} size={14} /> {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="acc-item-name" className="text-hero-muted">Название</Label>
              <Input
                id="acc-item-name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder={typeMeta(draft.type).placeholder}
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <div>
              <Label htmlFor="acc-item-params" className="text-hero-muted">Характеристики</Label>
              <Input
                id="acc-item-params"
                value={draft.params}
                onChange={(e) => setDraft((d) => ({ ...d, params: e.target.value }))}
                placeholder="Кратность, дальность обнаружения и т.п."
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <div>
              <Label htmlFor="acc-item-cost" className="text-hero-muted">Стоимость, ₽</Label>
              <Input
                id="acc-item-cost"
                type="number"
                inputMode="numeric"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                placeholder="45000"
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <PhotoUploadSlot
              label="Фото прибора"
              photo={draft.photo}
              onChange={(v) => setDraft((d) => ({ ...d, photo: v }))}
              icon={typeMeta(draft.type).icon}
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? 'Сохраняем…' : 'Сохранить'}{' '}
            <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessoryItems;
