import { useEffect, useState } from 'react';
import Header from '@/components/site/Header';
import Hero from '@/components/site/Hero';
import Cabinet from '@/components/site/Cabinet';
import Estate from '@/components/site/Estate';
import Tours from '@/components/site/Tours';
import MyCalendar from '@/components/site/MyCalendar';
import Hunts from '@/components/site/Hunts';
import Gear from '@/components/site/Gear';
import HuntChoice from '@/components/site/HuntChoice';
import Footer from '@/components/site/Footer';
import HunterOnboarding, { type HunterProfile } from '@/components/site/HunterOnboarding';
import { huntersApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useHuntEvents } from '@/hooks/use-hunt-events';

const HUNTER_ID_KEY = 'malyshenskoe_hunter_id';

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [profile, setProfile] = useState<HunterProfile | null>(null);
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-hero-bg font-body text-hero-text">
      <Header onStart={() => setAuthOpen(true)} />
      <Hero onStart={() => setAuthOpen(true)} />
      <Cabinet profile={profile} onStart={() => setAuthOpen(true)} />
      <MyCalendar
        hunterId={profile?.id}
        events={events}
        loading={eventsLoading}
        onUpsert={upsertEvent}
        onRemove={removeEvent}
      />
      <Hunts hunterId={profile?.id} events={events} loading={eventsLoading} onUpsert={upsertEvent} />
      <Gear hunterId={profile?.id} />
      <Estate onBook={() => scrollTo('hunt-choice')} />
      <HuntChoice onPick={() => scrollTo('tours')} />
      <Tours onBook={() => toast({ title: 'Бронирование туров скоро будет доступно', description: 'Мы готовим отдельный раздел для брони охотхозяйства.' })} />
      <Footer onStart={() => setAuthOpen(true)} />

      <HunterOnboarding open={authOpen} onOpenChange={setAuthOpen} onComplete={handleComplete} />
    </div>
  );
};

export default Index;