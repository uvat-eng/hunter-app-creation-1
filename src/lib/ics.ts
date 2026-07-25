interface IcsEvent {
  title: string;
  date: string;
  description?: string;
  location?: string;
  reminderMinutesBefore?: number;
}

function toIcsDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

export function downloadIcs(ev: IcsEvent) {
  const uid = `${Date.now()}@hunter-diary`;
  const dt = toIcsDate(ev.date);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Личный дневник охотника//RU',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dt}T000000Z`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dt}`,
    `SUMMARY:${escapeIcs(ev.title)}`,
  ];
  if (ev.description) lines.push(`DESCRIPTION:${escapeIcs(ev.description)}`);
  if (ev.location) lines.push(`LOCATION:${escapeIcs(ev.location)}`);
  if (ev.reminderMinutesBefore !== undefined) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcs(ev.title)}`,
      `TRIGGER:-PT${ev.reminderMinutesBefore}M`,
      'END:VALARM',
    );
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${ev.title.replace(/[^a-zа-яё0-9]+/gi, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeIcs(text: string): string {
  return text.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
}