import Hunts from '@/components/site/Hunts';
import { useHunter } from '@/contexts/HunterContext';

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
