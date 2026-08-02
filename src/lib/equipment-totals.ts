// Подсчёт суммарной стоимости имущества охотника: оружие, оружейные аксессуары и автомобили.
import { weaponsApi, accessoryItemsApi, carsApi } from '@/lib/api';

export interface EquipmentTotals {
  weaponsCost: number;
  accessoriesCost: number;
  carsBaseCost: number;
  carsEquipmentCost: number;
  carsTotalCost: number;
  grandTotal: number;
}

export const getEquipmentTotals = async (hunterId: string): Promise<EquipmentTotals> => {
  const [weapons, accessories, cars] = await Promise.all([
    weaponsApi.list(hunterId),
    accessoryItemsApi.list(hunterId),
    carsApi.list(hunterId),
  ]);

  const weaponsCost = weapons.reduce((sum, w) => sum + (w.cost || 0), 0);
  const accessoriesCost = accessories.reduce((sum, a) => sum + (a.cost || 0), 0);
  const carsBaseCost = cars.reduce((sum, c) => sum + (c.cost || 0), 0);
  const carsEquipmentCost = cars.reduce(
    (sum, c) =>
      sum +
      c.upgrades.reduce((s, u) => s + (u.cost || 0), 0) +
      c.maintenance.reduce((s, m) => s + (m.cost || 0), 0),
    0,
  );
  const carsTotalCost = carsBaseCost + carsEquipmentCost;

  return {
    weaponsCost,
    accessoriesCost,
    carsBaseCost,
    carsEquipmentCost,
    carsTotalCost,
    grandTotal: weaponsCost + accessoriesCost + carsTotalCost,
  };
};
