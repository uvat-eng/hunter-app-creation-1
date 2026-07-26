import Hero from '@/components/site/Hero';
import Cabinet from '@/components/site/Cabinet';
import { useHunter } from '@/contexts/HunterContext';

const Index = () => {
  const { profile, events, weaponsCount, setAuthOpen } = useHunter();

  return (
    <>
      <Hero onStart={() => setAuthOpen(true)} />
      <Cabinet profile={profile} events={events} weaponsCount={weaponsCount} onStart={() => setAuthOpen(true)} />
    </>
  );
};

export default Index;
