import Car from '@/components/site/Car';
import { useHunter } from '@/hooks/use-hunter';

const CarPage = () => {
  const { profile } = useHunter();

  return <Car hunterId={profile?.id} />;
};

export default CarPage;