import HuntMap from '@/components/site/HuntMap';
import { useHunter } from '@/contexts/HunterContext';

const MapPage = () => {
  const { profile, events, eventsLoading } = useHunter();

  return <HuntMap hunterId={profile?.id} events={events} loading={eventsLoading} />;
};

export default MapPage;
