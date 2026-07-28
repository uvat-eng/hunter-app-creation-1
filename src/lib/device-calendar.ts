import { isNativeApp } from './native';
import { downloadIcs } from './ics';

interface CalendarEventInput {
  title: string;
  date: string;
  description?: string;
  location?: string;
  reminderMinutesBefore?: number;
}

/**
 * Добавляет событие в системный календарь устройства (Android/iOS через Capacitor).
 * В веб-версии (не в приложении) — скачивает .ics файл, как раньше.
 * Возвращает true, если событие было добавлено в системный календарь устройства.
 */
export async function addToDeviceCalendar(ev: CalendarEventInput): Promise<boolean> {
  if (!isNativeApp) {
    downloadIcs(ev);
    return false;
  }

  try {
    const { CapacitorCalendar } = await import('@ebarooni/capacitor-calendar');

    const granted = await CapacitorCalendar.requestWriteOnlyCalendarAccess();
    if (granted.result !== 'granted') {
      downloadIcs(ev);
      return false;
    }

    const defaultCal = await CapacitorCalendar.getDefaultCalendar();
    const startDate = new Date(`${ev.date}T09:00:00`).getTime();
    const endDate = startDate + 60 * 60 * 1000;

    await CapacitorCalendar.createEvent({
      title: ev.title,
      calendarId: defaultCal.result?.id,
      location: ev.location,
      description: ev.description,
      startDate,
      endDate,
      isAllDay: false,
      alerts: ev.reminderMinutesBefore !== undefined ? [-ev.reminderMinutesBefore] : undefined,
    });

    return true;
  } catch {
    downloadIcs(ev);
    return false;
  }
}
