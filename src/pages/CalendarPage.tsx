import MyCalendar from '@/components/site/MyCalendar';
import { useHunter } from '@/hooks/use-hunter';

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