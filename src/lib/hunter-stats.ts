import type { HuntEventDto } from '@/lib/api';

export interface HunterStats {
  huntsDone: number;
  mapPoints: number;
  regionsCount: number;
  seasonTrophies: number;
}

export const getHunterStats = (events: HuntEventDto[]): HunterStats => {
  const currentYear = new Date().getFullYear();

  const huntsDone = events.filter((e) => e.status === 'done').length;

  const mapPoints = events.filter((e) => e.lat !== null && e.lng !== null).length;

  const regionsCount = new Set(
    events.map((e) => e.region?.trim()).filter((r): r is string => Boolean(r)),
  ).size;

  const seasonTrophies = events
    .filter((e) => new Date(e.date).getFullYear() === currentYear)
    .reduce((sum, ev) => sum + ev.trophies.reduce((s, t) => s + (parseInt(t.count, 10) || 1), 0), 0);

  return { huntsDone, mapPoints, regionsCount, seasonTrophies };
};
