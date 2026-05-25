import { CurrentWeather, ForecastResponse, WeatherDataPayload, GeocodingSuggestion } from "../types/weather";

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache duration

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

function getCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(`weather_cache_${key}`);
    if (!item) return null;
    const parsed: CacheItem<T> = JSON.parse(item);
    const now = Date.now();
    if (now - parsed.timestamp < CACHE_DURATION) {
      return parsed.data;
    }
    // Remove expired item
    localStorage.removeItem(`weather_cache_${key}`);
  } catch (e) {
    console.error("Cache read error:", e);
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`weather_cache_${key}`, JSON.stringify(item));
  } catch (e) {
    console.error("Cache write error:", e);
  }
}

export async function fetchWeatherData(
  query: string,
  lat?: number,
  lon?: number
): Promise<WeatherDataPayload> {
  const cacheKey =
    lat !== undefined && lon !== undefined
      ? `coords_${lat.toFixed(4)}_${lon.toFixed(4)}`
      : `query_${query.toLowerCase().trim()}`;

  const cached = getCache<WeatherDataPayload>(cacheKey);
  if (cached) {
    console.log(`[API Cache Hit] returning data for: ${cacheKey}`);
    return cached;
  }

  const apiKey = "5394fb3a5a94fa7361704e60021ec833";
  const baseUrl = "https://api.openweathermap.org/data/2.5";

  let weatherUrl = "";
  let forecastUrl = "";

  if (lat !== undefined && lon !== undefined) {
    weatherUrl = `${baseUrl}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    forecastUrl = `${baseUrl}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  } else {
    const cleanQuery = encodeURIComponent(query.trim());
    weatherUrl = `${baseUrl}/weather?q=${cleanQuery}&units=metric&appid=${apiKey}`;
    forecastUrl = `${baseUrl}/forecast?q=${cleanQuery}&units=metric&appid=${apiKey}`;
  }

  const [weatherRes, forecastRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(forecastUrl),
  ]);

  if (!weatherRes.ok) {
    if (weatherRes.status === 404) {
      throw new Error("City not found. Please double-check spelling.");
    }
    throw new Error(`Weather fetch failed: ${weatherRes.statusText}`);
  }

  if (!forecastRes.ok) {
    throw new Error(`Forecast fetch failed: ${forecastRes.statusText}`);
  }

  const current: CurrentWeather = await weatherRes.json();
  const forecast: ForecastResponse = await forecastRes.json();

  const data: WeatherDataPayload = { current, forecast };
  
  // Cache by searched parameters
  setCache(cacheKey, data);
  
  // Cache by exact city name returned from API to handle synonym city queries
  const nameKey = `query_${current.name.toLowerCase().trim()}`;
  setCache(nameKey, data);

  return data;
}

export async function fetchCitySuggestions(query: string): Promise<GeocodingSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = `geo_${query.toLowerCase().trim()}`;
  const cached = getCache<GeocodingSuggestion[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = "5394fb3a5a94fa7361704e60021ec833";
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query.trim()
  )}&limit=5&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  const data: GeocodingSuggestion[] = await res.json();
  setCache(cacheKey, data);
  return data;
}
