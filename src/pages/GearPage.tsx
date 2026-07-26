import Gear from '@/components/site/Gear';
import { useHunter } from '@/contexts/HunterContext';

const GearPage = () => {
  const { profile, setWeaponsCount } = useHunter();

  return <Gear hunterId={profile?.id} onCountChange={setWeaponsCount} />;
};

export default GearPage;
