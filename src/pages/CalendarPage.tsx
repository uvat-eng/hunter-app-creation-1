import MyCalendar from '@/components/site/MyCalendar';
import { useHunter } from '@/contexts/HunterContext';

const CalendarPage = () => {
  const { profile, events, eventsLoading, upsertEvent, removeEvent } = useHunter();

  return (
    <MyCalendar
      hunterId={profile?.id}
      events={events}
      loading={eventsLoading}
      onUpsert={upsertEvent}
      onRemove={removeEvent}
    />
  );
};

export default CalendarPage;
