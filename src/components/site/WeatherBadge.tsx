import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { fetchForecast, weatherCodeToIcon, type DailyWeather } from '@/lib/weather';

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

  if (!day) return null;

  return (
    <span className={`flex items-center gap-1 text-xs text-hero-muted ${className}`}>
      <Icon name={weatherCodeToIcon(day.weatherCode)} size={14} className="text-primary" />
      {day.tempMax}° / {day.tempMin}°
    </span>
  );
};

export default WeatherBadge;
