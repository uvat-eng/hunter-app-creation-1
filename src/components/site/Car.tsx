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
import { carsApi, MAX_CARS_PER_HUNTER, type CarDto, type CarUpgradeDto, type MaintenanceDto } from '@/lib/api';
import { genId } from '@/lib/local-db';
import PhotoUploadSlot from './PhotoUploadSlot';

const emptyCar = (): Omit<CarDto, 'id' | 'hunterId'> => ({
  brand: '',
  plate: '',
  photo: '',
  cost: null,
  upgrades: [],
  maintenance: [],
});

const formatMoney = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const Car = ({ hunterId }: { hunterId?: string }) => {
  const [cars, setCars] = useState<CarDto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [carOpen, setCarOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [carDraft, setCarDraft] = useState<Omit<CarDto, 'id' | 'hunterId'>>(emptyCar());
  const [carCostInput, setCarCostInput] = useState('');
  const [saving, setSaving] = useState(false);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeDraft, setUpgradeDraft] = useState({ name: '', note: '', cost: '' });

  const [serviceOpen, setServiceOpen] = useState(false);
  const [serviceDraft, setServiceDraft] = useState({ date: '', description: '', cost: '' });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!hunterId) {
      setCars([]);
      setActiveId(null);
      return;
    }
    setLoading(true);
    carsApi
      .list(hunterId)
      .then((list) => {
        setCars(list);
        setActiveId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0]?.id || null));
      })
      .catch(() => toast({ title: 'Не удалось загрузить данные автомобилей' }))
      .finally(() => setLoading(false));
  }, [hunterId]);

  const car = cars.find((c) => c.id === activeId) || null;

  const applyToList = (saved: CarDto, wasNew: boolean) => {
    setCars((list) => (wasNew ? [saved, ...list] : list.map((c) => (c.id === saved.id ? saved : c))));
    setActiveId(saved.id);
  };

  const persist = async (id: string | null, data: Omit<CarDto, 'id' | 'hunterId'>) => {
    if (!hunterId) return null;
    setSaving(true);
    try {
      const saved = id ? await carsApi.update(id, data) : await carsApi.create({ ...data, hunterId });
      applyToList(saved, !id);
      return saved;
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Не удалось сохранить' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const openAddCar = () => {
    if (!hunterId) {
      toast({ title: 'Сначала заведите карточку охотника' });
      return;
    }
    if (cars.length >= MAX_CARS_PER_HUNTER) {
      toast({ title: `Можно добавить не более ${MAX_CARS_PER_HUNTER} автомобилей` });
      return;
    }
    setCarDraft(emptyCar());
    setCarCostInput('');
    setEditId(null);
    setCarOpen(true);
  };

  const openEditCar = () => {
    if (!car) return;
    setCarDraft({ brand: car.brand, plate: car.plate, photo: car.photo, cost: car.cost, upgrades: car.upgrades, maintenance: car.maintenance });
    setCarCostInput(car.cost !== null && car.cost !== undefined ? String(car.cost) : '');
    setEditId(car.id);
    setCarOpen(true);
  };

  const saveCar = async () => {
    if (!carDraft.brand.trim() || !carDraft.plate.trim()) {
      toast({ title: 'Укажите марку и госномер' });
      return;
    }
    const payload = { ...carDraft, cost: carCostInput.trim() === '' ? null : Number(carCostInput) };
    const saved = await persist(editId, payload);
    if (saved) {
      toast({ title: editId ? 'Изменения сохранены' : 'Автомобиль добавлен' });
      setCarOpen(false);
    }
  };

  const confirmDeleteCar = async () => {
    if (!deleteId) return;
    try {
      await carsApi.remove(deleteId);
      setCars((list) => {
        const next = list.filter((c) => c.id !== deleteId);
        setActiveId(next[0]?.id || null);
        return next;
      });
      toast({ title: 'Автомобиль удалён' });
    } catch {
      toast({ title: 'Не удалось удалить автомобиль' });
    } finally {
      setDeleteId(null);
    }
  };

  const openAddUpgrade = () => {
    if (!car) {
      toast({ title: 'Сначала добавьте автомобиль' });
      return;
    }
    setUpgradeDraft({ name: '', note: '', cost: '' });
    setUpgradeOpen(true);
  };

  const saveUpgrade = async () => {
    if (!car || !upgradeDraft.name.trim()) {
      toast({ title: 'Укажите название апгрейда' });
      return;
    }
    const upgrade: CarUpgradeDto = {
      id: genId(),
      name: upgradeDraft.name,
      note: upgradeDraft.note,
      cost: upgradeDraft.cost.trim() === '' ? null : Number(upgradeDraft.cost),
    };
    const saved = await persist(car.id, { ...car, upgrades: [upgrade, ...car.upgrades] });
    if (saved) {
      toast({ title: 'Апгрейд добавлен' });
      setUpgradeOpen(false);
    }
  };

  const removeUpgrade = async (id: string) => {
    if (!car) return;
    await persist(car.id, { ...car, upgrades: car.upgrades.filter((u) => u.id !== id) });
  };

  const openAddService = () => {
    if (!car) {
      toast({ title: 'Сначала добавьте автомобиль' });
      return;
    }
    setServiceDraft({ date: '', description: '', cost: '' });
    setServiceOpen(true);
  };

  const saveService = async () => {
    if (!car || !serviceDraft.description.trim() || !serviceDraft.cost) {
      toast({ title: 'Укажите описание и сумму затрат' });
      return;
    }
    const record: MaintenanceDto = {
      id: genId(),
      date: serviceDraft.date,
      description: serviceDraft.description,
      cost: Number(serviceDraft.cost) || 0,
    };
    const saved = await persist(car.id, { ...car, maintenance: [record, ...car.maintenance] });
    if (saved) {
      toast({ title: 'Запись о ТО добавлена' });
      setServiceOpen(false);
    }
  };

  const removeService = async (id: string) => {
    if (!car) return;
    await persist(car.id, { ...car, maintenance: car.maintenance.filter((m) => m.id !== id) });
  };

  const maintenanceCost = (car?.maintenance || []).reduce((sum, m) => sum + (m.cost || 0), 0);
  const upgradesCost = (car?.upgrades || []).reduce((sum, u) => sum + (u.cost || 0), 0);
  const equipmentCost = maintenanceCost + upgradesCost;
  const baseCost = car?.cost || 0;
  const totalCarCost = baseCost + equipmentCost;

  return (
    <section id="car" className="border-t border-border bg-hero-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <SectionHeading
          eyebrow="Мой транспорт"
          title="Автомобили охотника"
          description={`Марка, госномер, установленные апгрейды и история техобслуживания с учётом затрат — до ${MAX_CARS_PER_HUNTER} автомобилей.`}
        />

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-hero-bg px-6 py-16 text-hero-muted">
            <Icon name="Loader2" size={20} className="animate-spin" /> Загружаем…
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-hero-bg px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Icon name="Car" size={26} />
            </span>
            <div>
              <div className="font-head text-lg font-semibold text-hero-text">Автомобиль ещё не добавлен</div>
              <p className="mt-1 text-sm text-hero-muted">
                {hunterId ? 'Добавьте машину, на которой ездите на охоту.' : 'Заведите карточку охотника, чтобы начать.'}
              </p>
            </div>
            <button
              onClick={openAddCar}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Icon name="Plus" size={18} /> Добавить автомобиль
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {cars.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex items-center gap-2 rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                    activeId === c.id
                      ? 'border-primary bg-primary/12 text-primary'
                      : 'border-border text-hero-muted hover:border-primary/50 hover:text-hero-text'
                  }`}
                >
                  <Icon name="Car" size={15} />
                  {c.brand || 'Без марки'} · {c.plate || '—'}
                </button>
              ))}
              {cars.length < MAX_CARS_PER_HUNTER && (
                <button
                  onClick={openAddCar}
                  className="flex items-center gap-1.5 rounded-sm border border-dashed border-border px-4 py-2 text-sm text-hero-muted transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon name="Plus" size={15} /> Добавить ({cars.length}/{MAX_CARS_PER_HUNTER})
                </button>
              )}
            </div>

            {car && (
              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <div className="overflow-hidden rounded-lg border border-border bg-hero-bg">
                    {car.photo ? (
                      <img src={car.photo} alt={car.brand} className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center bg-primary/12 text-primary">
                        <Icon name="Car" size={40} />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="font-head text-3xl font-bold uppercase tracking-tight text-hero-text">{car.brand}</div>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-3 py-1.5 font-head text-2xl font-bold tracking-widest text-primary">
                        {car.plate}
                      </div>
                      <div className="mt-5 flex gap-2">
                        <button
                          onClick={openEditCar}
                          className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-border py-2.5 text-sm text-hero-muted transition-colors hover:border-primary hover:text-primary"
                        >
                          <Icon name="Pencil" size={15} /> Редактировать
                        </button>
                        <button
                          onClick={() => setDeleteId(car.id)}
                          className="flex items-center justify-center gap-2 rounded-sm border border-border px-3 py-2.5 text-sm text-hero-muted transition-colors hover:border-destructive hover:text-destructive"
                          aria-label="Удалить автомобиль"
                        >
                          <Icon name="Trash2" size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-5">
                    <div className="text-xs uppercase tracking-wide text-hero-muted">Общая стоимость автомобиля</div>
                    <div className="mt-1 font-head text-3xl font-bold text-primary">{formatMoney(totalCarCost)}</div>
                    <div className="mt-4 space-y-1.5 border-t border-primary/30 pt-3 text-sm text-hero-muted">
                      <div className="flex items-center justify-between">
                        <span>Стоимость автомобиля</span>
                        <span className="font-medium text-hero-text">{formatMoney(baseCost)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Доп. оборудование и содержание</span>
                        <span className="font-medium text-hero-text">{formatMoney(equipmentCost)}</span>
                      </div>
                      <div className="flex items-center justify-between pl-3 text-xs">
                        <span>— апгрейды</span>
                        <span>{formatMoney(upgradesCost)}</span>
                      </div>
                      <div className="flex items-center justify-between pl-3 text-xs">
                        <span>— техобслуживание</span>
                        <span>{formatMoney(maintenanceCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 lg:col-span-3">
                  <div className="rounded-lg border border-border bg-hero-bg p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-head text-lg font-semibold text-hero-text">Апгрейды</h3>
                      <button
                        onClick={openAddUpgrade}
                        className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs text-hero-muted transition-colors hover:border-primary hover:text-primary"
                      >
                        <Icon name="Plus" size={14} /> Добавить
                      </button>
                    </div>
                    {car.upgrades.length === 0 ? (
                      <p className="mt-3 text-sm text-hero-muted">Апгрейдов пока нет.</p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {car.upgrades.map((u) => (
                          <li key={u.id} className="group flex items-start gap-2.5 border-t border-border pt-3 first:border-t-0 first:pt-0">
                            <Icon name="Wrench" size={15} className="mt-0.5 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-hero-text">{u.name}</div>
                              {u.note && <div className="text-xs text-hero-muted">{u.note}</div>}
                              {u.cost !== null && u.cost !== undefined && (
                                <div className="mt-0.5 text-xs font-medium text-primary">{formatMoney(u.cost)}</div>
                              )}
                            </div>
                            <button
                              onClick={() => removeUpgrade(u.id)}
                              className="shrink-0 text-hero-muted opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                              aria-label="Удалить"
                            >
                              <Icon name="Trash2" size={15} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-lg border border-border bg-hero-bg p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-head text-lg font-semibold text-hero-text">Техобслуживание</h3>
                      <button
                        onClick={openAddService}
                        className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs text-hero-muted transition-colors hover:border-primary hover:text-primary"
                      >
                        <Icon name="Plus" size={14} /> Добавить
                      </button>
                    </div>
                    {car.maintenance.length === 0 ? (
                      <p className="mt-3 text-sm text-hero-muted">Записей о ТО пока нет.</p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {car.maintenance.map((m) => (
                          <li key={m.id} className="group flex items-start gap-2.5 border-t border-border pt-3 first:border-t-0 first:pt-0">
                            <Icon name="Wrench" size={15} className="mt-0.5 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-hero-text">{m.description}</div>
                              <div className="text-xs text-hero-muted">
                                {m.date && `${new Date(m.date).toLocaleDateString('ru')} · `}
                                {formatMoney(m.cost)}
                              </div>
                            </div>
                            <button
                              onClick={() => removeService(m.id)}
                              className="shrink-0 text-hero-muted opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                              aria-label="Удалить"
                            >
                              <Icon name="Trash2" size={15} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={carOpen} onOpenChange={setCarOpen}>
        <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">
              {editId ? 'Редактировать автомобиль' : 'Новый автомобиль'}
            </DialogTitle>
            <DialogDescription className="text-hero-muted">Марка, госномер и фото автомобиля</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="car-brand" className="text-hero-muted">Марка и модель</Label>
              <Input
                id="car-brand"
                value={carDraft.brand}
                onChange={(e) => setCarDraft((d) => ({ ...d, brand: e.target.value }))}
                placeholder="УАЗ Патриот"
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <div>
              <Label htmlFor="car-plate" className="text-hero-muted">Госномер</Label>
              <Input
                id="car-plate"
                value={carDraft.plate}
                onChange={(e) => setCarDraft((d) => ({ ...d, plate: e.target.value.toUpperCase() }))}
                placeholder="А123БВ72"
                className="mt-1.5 border-border bg-hero-bg uppercase"
              />
            </div>
            <div>
              <Label htmlFor="car-cost" className="text-hero-muted">Стоимость автомобиля, ₽</Label>
              <Input
                id="car-cost"
                type="number"
                inputMode="numeric"
                value={carCostInput}
                onChange={(e) => setCarCostInput(e.target.value)}
                placeholder="850000"
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <PhotoUploadSlot
              label="Фото автомобиля"
              photo={carDraft.photo}
              onChange={(v) => setCarDraft((d) => ({ ...d, photo: v }))}
              icon="Car"
            />
          </div>
          <button
            onClick={saveCar}
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? 'Сохраняем…' : 'Сохранить'}{' '}
            <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">Новый апгрейд</DialogTitle>
            <DialogDescription className="text-hero-muted">Что установили или доработали в автомобиле</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="up-name" className="text-hero-muted">Название</Label>
              <Input
                id="up-name"
                value={upgradeDraft.name}
                onChange={(e) => setUpgradeDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Лебёдка, силовой бампер, шноркель…"
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <div>
              <Label htmlFor="up-note" className="text-hero-muted">Комментарий</Label>
              <Input
                id="up-note"
                value={upgradeDraft.note}
                onChange={(e) => setUpgradeDraft((d) => ({ ...d, note: e.target.value }))}
                placeholder="Модель, характеристики"
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <div>
              <Label htmlFor="up-cost" className="text-hero-muted">Стоимость, ₽</Label>
              <Input
                id="up-cost"
                type="number"
                inputMode="numeric"
                value={upgradeDraft.cost}
                onChange={(e) => setUpgradeDraft((d) => ({ ...d, cost: e.target.value }))}
                placeholder="25000"
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
          </div>
          <button
            onClick={saveUpgrade}
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? 'Сохраняем…' : 'Добавить'}{' '}
            <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceOpen} onOpenChange={setServiceOpen}>
        <DialogContent className="max-w-md border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl font-bold tracking-tight">Запись о ТО</DialogTitle>
            <DialogDescription className="text-hero-muted">Что сделали и сколько потратили</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="srv-date" className="text-hero-muted">Дата</Label>
              <Input
                id="srv-date"
                type="date"
                value={serviceDraft.date}
                onChange={(e) => setServiceDraft((d) => ({ ...d, date: e.target.value }))}
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <div>
              <Label htmlFor="srv-desc" className="text-hero-muted">Что сделано</Label>
              <Input
                id="srv-desc"
                value={serviceDraft.description}
                onChange={(e) => setServiceDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Замена масла и фильтров"
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
            <div>
              <Label htmlFor="srv-cost" className="text-hero-muted">Сумма затрат, ₽</Label>
              <Input
                id="srv-cost"
                type="number"
                inputMode="numeric"
                value={serviceDraft.cost}
                onChange={(e) => setServiceDraft((d) => ({ ...d, cost: e.target.value }))}
                placeholder="3500"
                className="mt-1.5 border-border bg-hero-bg"
              />
            </div>
          </div>
          <button
            onClick={saveService}
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-primary py-3 font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? 'Сохраняем…' : 'Добавить'}{' '}
            <Icon name={saving ? 'Loader2' : 'Check'} size={18} className={saving ? 'animate-spin' : ''} />
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm border-border bg-hero-surface text-hero-text">
          <DialogHeader>
            <DialogTitle className="font-head text-xl font-bold tracking-tight">Удалить автомобиль?</DialogTitle>
            <DialogDescription className="text-hero-muted">
              Все апгрейды и записи о техобслуживании этого автомобиля будут удалены безвозвратно.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 rounded-sm border border-border py-2.5 text-sm text-hero-muted transition-colors hover:text-hero-text"
            >
              Отмена
            </button>
            <button
              onClick={confirmDeleteCar}
              className="flex-1 rounded-sm bg-destructive py-2.5 text-sm font-bold text-destructive-foreground transition-transform hover:-translate-y-0.5"
            >
              Удалить
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Car;