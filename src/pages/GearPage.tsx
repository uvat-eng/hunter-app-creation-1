import Gear from '@/components/site/Gear';
import { useHunter } from '@/hooks/use-hunter';

const GearPage = () => {
  const { profile, setWeaponsCount } = useHunter();

  return <Gear hunterId={profile?.id} onCountChange={setWeaponsCount} />;
};

export default GearPage;