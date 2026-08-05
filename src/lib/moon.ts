// Расчёт лунной фазы на дату — по формуле синодического месяца, без внешних запросов.

export interface MoonPhase {
  /** 0..1, доля освещённости диска */
  illumination: number;
  /** 0..7 — индекс фазы (0 = новолуние, 4 = полнолуние) */
  phaseIndex: number;
  label: string;
  icon: string;
}

const SYNODIC_MONTH = 29.530588853;
// известное новолуние: 6 января 2000, 18:14 UTC
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

const PHASES = [
  { label: 'Новолуние', icon: 'MoonStar' },
  { label: 'Растущий серп', icon: 'Moon' },
  { label: 'Первая четверть', icon: 'MoonStar' },
  { label: 'Растущая луна', icon: 'Moon' },
  { label: 'Полнолуние', icon: 'Moon' },
  { label: 'Убывающая луна', icon: 'Moon' },
  { label: 'Последняя четверть', icon: 'MoonStar' },
  { label: 'Убывающий серп', icon: 'Moon' },
];

export const getMoonPhase = (isoDate: string): MoonPhase => {
  const d = new Date(`${isoDate}T12:00:00Z`).getTime();
  const daysSince = (d - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const age = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const fraction = age / SYNODIC_MONTH; // 0..1

  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const phaseIndex = Math.round(fraction * 8) % 8;

  return {
    illumination,
    phaseIndex,
    label: PHASES[phaseIndex].label,
    icon: PHASES[phaseIndex].icon,
  };
};
