import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { fetchForecast, weatherCodeToIcon, type DailyWeather } from '@/lib/weather';
import { getMoonPhase } from '@/lib/moon';

interface Props {
  lat: number | null;
  lng: number | null;
  date: string;
  className?: string;
}

/** Компактная иконка погоды для карточек/строк — показывается только если дата попадает в ближайшие 7 дней прогноза. */
const WeatherBadge = ({ lat, lng, date, className = '' }: Props) => {
  const [day, setDay] = useState<DailyWeather | null>(null);

  useEffect(() => {
    if (lat === null || lng === null || !date) {
      setDay(null);
      return;
    }
    let cancelled = false;
    fetchForecast(lat, lng)
      .then((r) => {
        if (cancelled) return;
        setDay(r.days.find((d) => d.date === date) || null);
      })
      .catch(() => {
        if (!cancelled) setDay(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, date]);

  if (!day && !date) return null;

  const moon = date ? getMoonPhase(date) : null;

  return (
    <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-hero-muted ${className}`}>
      {day && (
        <span className="flex items-center gap-1">
          <Icon name={weatherCodeToIcon(day.weatherCode)} size={14} className="text-primary" />
          {day.tempMax}° / {day.tempMin}°
        </span>
      )}
      {moon && (
        <span className="flex items-center gap-1">
          <Icon name={moon.icon} size={14} className="text-primary" />
          {moon.label}
        </span>
      )}
    </span>
  );
};

export default WeatherBadge;