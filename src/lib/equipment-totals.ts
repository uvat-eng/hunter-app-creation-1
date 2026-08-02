// Подсчёт суммарной стоимости имущества и затрат охотника:
// оружие, оружейные аксессуары, автомобили и бюджет выездов на охоту.
import { weaponsApi, accessoryItemsApi, carsApi, huntEventsApi } from '@/lib/api';

export interface EquipmentTotals {
  weaponsCost: number;
  accessoriesCost: number;
  weaponryBudget: number;
  carsBaseCost: number;
  carsEquipmentCost: number;
  carsTotalCost: number;
  huntsBudget: number;
  grandTotal: number;
}

export const getEquipmentTotals = async (hunterId: string): Promise<EquipmentTotals> => {
  const [weapons, accessories, cars, hunts] = await Promise.all([
    weaponsApi.list(hunterId),
    accessoryItemsApi.list(hunterId),
    carsApi.list(hunterId),
    huntEventsApi.list(hunterId),
  ]);

  const weaponsCost = weapons.reduce((sum, w) => sum + (w.cost || 0), 0);
  const accessoriesCost = accessories.reduce((sum, a) => sum + (a.cost || 0), 0);
  const weaponryBudget = weaponsCost + accessoriesCost;
  const carsBaseCost = cars.reduce((sum, c) => sum + (c.cost || 0), 0);
  const carsEquipmentCost = cars.reduce(
    (sum, c) =>
      sum +
      c.upgrades.reduce((s, u) => s + (u.cost || 0), 0) +
      c.maintenance.reduce((s, m) => s + (m.cost || 0), 0),
    0,
  );
  const carsTotalCost = carsBaseCost + carsEquipmentCost;
  const huntsBudget = hunts.reduce((sum, h) => sum + (h.budget || 0), 0);

  return {
    weaponsCost,
    accessoriesCost,
    weaponryBudget,
    carsBaseCost,
    carsEquipmentCost,
    carsTotalCost,
    huntsBudget,
    grandTotal: weaponryBudget + carsTotalCost + huntsBudget,
  };
};