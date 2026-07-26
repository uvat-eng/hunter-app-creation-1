import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { huntersApi } from '@/lib/api';
import type { HuntEventDto } from '@/lib/api';
import { useHuntEvents } from '@/hooks/use-hunt-events';
import type { HunterProfile } from '@/components/site/HunterOnboarding';

const HUNTER_ID_KEY = 'hunter_diary_hunter_id';

interface HunterContextValue {
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

const HunterContext = createContext<HunterContextValue | null>(null);

export const HunterProvider = ({ children }: { children: ReactNode }) => {
  const [authOpen, setAuthOpen] = useState(false);
  const [profile, setProfile] = useState<HunterProfile | null>(null);
  const [weaponsCount, setWeaponsCount] = useState(0);
  const { events, loading: eventsLoading, removeEvent, upsertEvent } = useHuntEvents(profile?.id);

  useEffect(() => {
    const savedId = localStorage.getItem(HUNTER_ID_KEY);
    if (!savedId) return;
    huntersApi
      .get(savedId)
      .then((h) =>
        setProfile({
          id: h.id,
          name: h.name,
          city: h.city,
          ticket: h.ticket,
          ticketDate: h.ticket_date || '',
          photo: h.photo,
          experience: h.experience,
          weapon: h.weapon,
          game: h.game,
        }),
      )
      .catch(() => localStorage.removeItem(HUNTER_ID_KEY));
  }, []);

  const handleComplete = (p: HunterProfile) => {
    setProfile(p);
    if (p.id) localStorage.setItem(HUNTER_ID_KEY, p.id);
  };

  return (
    <HunterContext.Provider
      value={{
        profile,
        handleComplete,
        events,
        eventsLoading,
        upsertEvent,
        removeEvent,
        weaponsCount,
        setWeaponsCount,
        authOpen,
        setAuthOpen,
      }}
    >
      {children}
    </HunterContext.Provider>
  );
};

export const useHunter = () => {
  const ctx = useContext(HunterContext);
  if (!ctx) throw new Error('useHunter must be used within HunterProvider');
  return ctx;
};
