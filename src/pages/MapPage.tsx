import HuntMap from '@/components/site/HuntMap';
import { useHunter } from '@/hooks/use-hunter';

const MapPage = () => {
  const { profile, events, eventsLoading } = useHunter();

  return <HuntMap hunterId={profile?.id} events={events} loading={eventsLoading} />;
};

export default MapPage;