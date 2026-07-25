import { useCallback, useEffect, useState } from 'react';
import { huntEventsApi, type HuntEventDto } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export function useHuntEvents(hunterId?: string) {
  const [events, setEvents] = useState<HuntEventDto[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!hunterId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    huntEventsApi
      .list(hunterId)
      .then(setEvents)
      .catch(() => toast({ title: 'Не удалось загрузить календарь' }))
      .finally(() => setLoading(false));
  }, [hunterId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const removeEvent = async (id: string) => {
    try {
      await huntEventsApi.remove(id);
      setEvents((es) => es.filter((e) => e.id !== id));
      toast({ title: 'Событие удалено' });
    } catch {
      toast({ title: 'Не удалось удалить' });
    }
  };

  const upsertEvent = (saved: HuntEventDto) => {
    setEvents((es) => (es.some((e) => e.id === saved.id) ? es.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...es]));
  };

  return { events, setEvents, loading, refresh, removeEvent, upsertEvent };
}
