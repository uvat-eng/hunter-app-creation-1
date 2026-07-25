import { useState } from 'react';
import Header from '@/components/site/Header';
import Hero from '@/components/site/Hero';
import Cabinet from '@/components/site/Cabinet';
import Estate from '@/components/site/Estate';
import Tours from '@/components/site/Tours';
import Booking from '@/components/site/Booking';
import Hunts from '@/components/site/Hunts';
import Gear from '@/components/site/Gear';
import Footer from '@/components/site/Footer';
import HunterOnboarding, { type HunterProfile } from '@/components/site/HunterOnboarding';

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [profile, setProfile] = useState<HunterProfile | null>(null);

  const openBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-hero-bg font-body text-hero-text">
      <Header onStart={() => setAuthOpen(true)} />
      <Hero onStart={() => setAuthOpen(true)} />
      <Cabinet profile={profile} onStart={() => setAuthOpen(true)} />
      <Estate onBook={openBooking} />
      <Tours onBook={openBooking} />
      <Booking />
      <Hunts />
      <Gear />
      <Footer onStart={() => setAuthOpen(true)} />

      <HunterOnboarding open={authOpen} onOpenChange={setAuthOpen} onComplete={setProfile} />
    </div>
  );
};

export default Index;
