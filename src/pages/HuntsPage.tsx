import Hunts from '@/components/site/Hunts';
import { useHunter } from '@/hooks/use-hunter';

const HuntsPage = () => {
  const { profile, events, eventsLoading, upsertEvent, removeEvent } = useHunter();

  return (
    <Hunts
      hunterId={profile?.id}
      events={events}
      loading={eventsLoading}
      onUpsert={upsertEvent}
      onRemove={removeEvent}
    />
  );
};

export default HuntsPage;