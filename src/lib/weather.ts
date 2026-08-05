// Погода через Open-Meteo (бесплатно, без API-ключа): прогноз на неделю и архивные данные.

export interface DailyWeather {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windMax: number;
}

export interface ForecastResult {
  days: DailyWeather[];
}

export interface HistoricalResult {
  day: DailyWeather | null;
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

const DAILY_FIELDS = 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max';

interface OpenMeteoDaily {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  windspeed_10m_max: number[];
}

const parseDaily = (daily: OpenMeteoDaily): DailyWeather[] =>
  daily.time.map((date, i) => ({
    date,
    weatherCode: daily.weathercode[i],
    tempMax: Math.round(daily.temperature_2m_max[i]),
    tempMin: Math.round(daily.temperature_2m_min[i]),
    precipitation: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
    windMax: Math.round(daily.windspeed_10m_max[i]),
  }));

export const fetchForecast = async (lat: number, lng: number): Promise<ForecastResult> => {
  const url = `${FORECAST_URL}?latitude=${lat}&longitude=${lng}&daily=${DAILY_FIELDS}&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather forecast failed');
  const json = await res.json();
  return { days: parseDaily(json.daily) };
};

const shiftYear = (isoDate: string, years: number): string => {
  const d = new Date(isoDate);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
};

export const fetchHistoricalSameDateLastYear = async (
  lat: number,
  lng: number,
  isoDate: string,
): Promise<HistoricalResult> => {
  const target = shiftYear(isoDate, -1);
  const url = `${ARCHIVE_URL}?latitude=${lat}&longitude=${lng}&start_date=${target}&end_date=${target}&daily=${DAILY_FIELDS}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather archive failed');
  const json = await res.json();
  const days = parseDaily(json.daily);
  return { day: days[0] || null };
};

export const weatherCodeToIcon = (code: number): string => {
  if (code === 0) return 'Sun';
  if ([1, 2].includes(code)) return 'CloudSun';
  if (code === 3) return 'Cloud';
  if ([45, 48].includes(code)) return 'CloudFog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'CloudDrizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'CloudRain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'CloudSnow';
  if ([95, 96, 99].includes(code)) return 'CloudLightning';
  return 'Cloud';
};

export const weatherCodeToLabel = (code: number): string => {
  if (code === 0) return 'Ясно';
  if ([1, 2].includes(code)) return 'Малооблачно';
  if (code === 3) return 'Облачно';
  if ([45, 48].includes(code)) return 'Туман';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Морось';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Дождь';
  if ([80, 81, 82].includes(code)) return 'Ливень';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Снег';
  if ([95, 96, 99].includes(code)) return 'Гроза';
  return 'Погода';
};

export const weekdayShort = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('ru', { weekday: 'short' });

export const dayMonthShort = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('ru', { day: 'numeric', month: 'short' });
