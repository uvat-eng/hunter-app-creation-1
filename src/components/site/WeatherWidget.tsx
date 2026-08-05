import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  fetchForecast,
  fetchHistoricalSameDateLastYear,
  weatherCodeToIcon,
  weatherCodeToLabel,
  weekdayShort,
  dayMonthShort,
  type DailyWeather,
} from '@/lib/weather';

interface Props {
  lat: number | null;
  lng: number | null;
  /** ISO-дата события — для сравнения с прошлым годом (опционально) */
  date?: string;
  className?: string;
}

const WeatherWidget = ({ lat, lng, date, className = '' }: Props) => {
  const [forecast, setForecast] = useState<DailyWeather[] | null>(null);
  const [lastYear, setLastYear] = useState<DailyWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lat === null || lng === null) {
      setForecast(null);
      setLastYear(null);
      return;
    }
    setLoading(true);
    setError(false);

    const tasks: Promise<void>[] = [
      fetchForecast(lat, lng)
        .then((r) => setForecast(r.days))
        .catch(() => setError(true)),
    ];

    if (date) {
      tasks.push(
        fetchHistoricalSameDateLastYear(lat, lng, date)
          .then((r) => setLastYear(r.day))
          .catch(() => {
            /* архив не критичен — просто не покажем сравнение */
          }),
      );
    }

    Promise.all(tasks).finally(() => setLoading(false));
  }, [lat, lng, date]);

  if (lat === null || lng === null) return null;

  return (
    <div className={`rounded-lg border border-border bg-hero-surface p-5 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon name="CloudSun" size={16} className="text-primary" />
        <span className="text-xs uppercase tracking-wide text-hero-muted">Погода на неделю</span>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-sm text-hero-muted">
          <Icon name="Loader2" size={16} className="animate-spin" /> Загружаем прогноз…
        </div>
      ) : error || !forecast ? (
        <div className="mt-4 flex items-center gap-2 py-4 text-sm text-hero-muted">
          <Icon name="CloudOff" size={16} /> Не удалось загрузить прогноз
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {forecast.map((d) => (
              <div
                key={d.date}
                className="flex flex-col items-center gap-1 rounded-sm border border-border bg-hero-bg px-1.5 py-3 text-center"
              >
                <span className="text-[10px] uppercase text-hero-muted">{weekdayShort(d.date)}</span>
                <Icon name={weatherCodeToIcon(d.weatherCode)} size={20} className="text-primary" />
                <span className="text-xs font-medium text-hero-text">
                  {d.tempMax}° / {d.tempMin}°
                </span>
                {d.precipitation > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-hero-muted">
                    <Icon name="Droplets" size={10} /> {d.precipitation} мм
                  </span>
                )}
              </div>
            ))}
          </div>

          {date && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-2 text-xs uppercase tracking-wide text-hero-muted">
                Сравнение с прошлым годом · {dayMonthShort(date)}
              </div>
              {lastYear ? (
                <div className="flex items-center gap-3 rounded-sm border border-border bg-hero-bg px-3 py-2.5 text-sm">
                  <Icon name={weatherCodeToIcon(lastYear.weatherCode)} size={18} className="text-primary" />
                  <span className="text-hero-text">{weatherCodeToLabel(lastYear.weatherCode)}</span>
                  <span className="text-hero-muted">
                    {lastYear.tempMax}° / {lastYear.tempMin}°
                  </span>
                  {lastYear.precipitation > 0 && (
                    <span className="flex items-center gap-1 text-hero-muted">
                      <Icon name="Droplets" size={12} /> {lastYear.precipitation} мм
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-sm text-hero-muted">Архивные данные недоступны для этой даты</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeatherWidget;
