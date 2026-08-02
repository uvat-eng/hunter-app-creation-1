import { createContext } from 'react';
import type { HuntEventDto } from '@/lib/api';
import type { HunterProfile } from '@/components/site/HunterOnboarding';

export interface HunterContextValue {
  profile: HunterProfile | null;
  handleComplete: (p: HunterProfile) => void;
  events: HuntEventDto[];
  eventsLoading: boolean;
  upsertEvent: (saved: HuntEventDto) => void;
  removeEvent: (id: string) => void;
  weaponsCount: number;
  setWeaponsCount: (n: number) => void;
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;
}

export const HunterContext = createContext<HunterContextValue | null>(null);
