import { useEffect, useState } from 'react';
import Header from '@/components/site/Header';
import Hero from '@/components/site/Hero';
import Cabinet from '@/components/site/Cabinet';
import Estate from '@/components/site/Estate';
import Tours from '@/components/site/Tours';
import Booking from '@/components/site/Booking';
import Hunts from '@/components/site/Hunts';
import Gear from '@/components/site/Gear';
import HuntChoice from '@/components/site/HuntChoice';
import Footer from '@/components/site/Footer';
import HunterOnboarding, { type HunterProfile } from '@/components/site/HunterOnboarding';
import { huntersApi } from '@/lib/api';

const HUNTER_ID_KEY = 'malyshenskoe_hunter_id';

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [profile, setProfile] = useState<HunterProfile | null>(null);

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
      <Booking hunterId={profile?.id} />
      <Gear hunterId={profile?.id} />
      <Hunts />
      <Estate onBook={() => scrollTo('hunt-choice')} />
      <HuntChoice onPick={() => scrollTo('tours')} />
      <Tours onBook={() => scrollTo('booking')} />
      <Footer onStart={() => setAuthOpen(true)} />

      <HunterOnboarding open={authOpen} onOpenChange={setAuthOpen} onComplete={handleComplete} />
    </div>
  );
};

export default Index;