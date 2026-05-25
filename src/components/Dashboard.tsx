import React, { useState, useEffect, useRef } from "react";
import { 
  Search, MapPin, Wind, Droplets, Thermometer, Gauge, 
  AlertTriangle, History, X 
} from "lucide-react";
import { fetchWeatherData, fetchCitySuggestions } from "../utils/api";
import { useDebounce } from "../hooks/useDebounce";
import { 
  CurrentWeather, ForecastResponse, GeocodingSuggestion, SearchHistoryItem 
} from "../types/weather";
import WeatherEffects from "./WeatherEffects";
import LoadingSkeleton from "./LoadingSkeleton";
import WeatherChart from "./WeatherChart";
import SearchHistory from "./SearchHistory";

// Asset Imports for Weather Background Scenes
import cold from "../assets/cold.jpg";
import thunder from "../assets/thunder.jpg";
import mist from "../assets/mist.jpg";
import drizzle from "../assets/drizzle.jpg";
import rainy from "../assets/rainy.jpg";
import sunny from "../assets/sunny.jpg";
import clouds from "../assets/clouds.jpg";
import neutral from "../assets/neutral.jpg";

interface DashboardProps {
  id: string;
  defaultCity: string;
  history: SearchHistoryItem[];
  addHistoryItem: (name: string, country: string, lat?: number, lon?: number) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  id,
  defaultCity,
  history,
  addHistoryItem,
  removeHistoryItem,
  clearHistory,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bgImage, setBgImage] = useState(neutral);

  const debouncedQuery = useDebounce(query, 350);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Close suggestions and history dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch geocoding suggestions based on debounced search query
  useEffect(() => {
    const loadSuggestions = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await fetchCitySuggestions(debouncedQuery);
        setSuggestions(results);
      } catch (err) {
        console.error("Geocoding fetch failed", err);
      }
    };
    loadSuggestions();
  }, [debouncedQuery]);

  // Map weather conditions to background assets
  const updateBackground = (mainCondition: string) => {
    const main = mainCondition.toLowerCase();
    if (main.includes("thunder")) setBgImage(thunder);
    else if (main.includes("drizzle")) setBgImage(drizzle);
    else if (main.includes("rain")) setBgImage(rainy);
    else if (main.includes("snow") || main.includes("cold")) setBgImage(cold);
    else if (main.includes("clear") || main.includes("sun")) setBgImage(sunny);
    else if (main.includes("cloud")) setBgImage(clouds);
    else if (
      main.includes("mist") ||
      main.includes("haze") ||
      main.includes("fog") ||
      main.includes("smoke") ||
      main.includes("dust")
    ) {
      setBgImage(mist);
    } else {
      setBgImage(neutral);
    }
  };

  // Perform API loading logic
  const loadWeatherData = async (cityName: string, lat?: number, lon?: number) => {
    setIsLoading(true);
    setErrorMsg("");
    setShowSuggestions(false);
    setShowHistory(false);
    try {
      const data = await fetchWeatherData(cityName, lat, lon);
      setCurrentWeather(data.current);
      setForecast(data.forecast);
      updateBackground(data.current.weather[0].main);

      // Save to Search History
      addHistoryItem(
        data.current.name, 
        data.current.sys.country, 
        data.current.coord.lat, 
        data.current.coord.lon
      );
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: Geolocation or Default City
  useEffect(() => {
    const tryGeolocation = () => {
      if ("geolocation" in navigator) {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            loadWeatherData("", latitude, longitude);
          },
          (error) => {
            console.log("Geolocation permission denied or errored. Using default city.", error);
            loadWeatherData(defaultCity);
          },
          { timeout: 6000 }
        );
      } else {
        loadWeatherData(defaultCity);
      }
    };
    tryGeolocation();
  }, [defaultCity]);

  // Execute geolocation lookup manually
  const handleGeolocationClick = () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      setErrorMsg("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          loadWeatherData("", latitude, longitude);
        },
        (error) => {
          setIsLoading(false);
          setErrorMsg("Could not access your location. Please check browser permissions.");
          console.error(error);
        }
      );
    } else {
      setErrorMsg("Geolocation is not supported by your browser.");
    }
  };

  // Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === "") {
      setErrorMsg("Please enter a city name to search.");
      return;
    }
    loadWeatherData(query);
    setQuery("");
  };

  // Select Suggestion
  const handleSuggestionSelect = (city: GeocodingSuggestion) => {
    loadWeatherData(`${city.name}, ${city.country}`, city.lat, city.lon);
    setQuery("");
  };

  // Select History
  const handleHistorySelect = (item: SearchHistoryItem) => {
    loadWeatherData(`${item.name}, ${item.country}`, item.lat, item.lon);
  };

  // Filter 5-day forecast points (one per day, prioritizing midday)
  const getDailyForecasts = (list: any[]) => {
    const daily: any[] = [];
    const seenDays = new Set<string>();

    list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      const isMidday = item.dt_txt.includes("12:00:00");

      if (!seenDays.has(date)) {
        seenDays.add(date);
        daily.push(item);
      } else if (isMidday) {
        const idx = daily.findIndex((d) => d.dt_txt.startsWith(date));
        if (idx !== -1) {
          daily[idx] = item;
        }
      }
    });

    return daily.slice(0, 5);
  };

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr.replace(/-/g, "/"));
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div 
      id={`dashboard-${id}`}
      className="dashboard-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Animated Weather Overlay Effect */}
      {currentWeather && !isLoading && !errorMsg && (
        <WeatherEffects condition={currentWeather.weather[0].main} />
      )}

      {/* Glassmorphic Panel Content */}
      <div className="dashboard-content glass-panel">
        
        {/* Search header controls */}
        <div className="search-bar-row">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search city..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {query && (
              <button 
                type="button" 
                className="clear-input-btn"
                onClick={() => { setQuery(""); setSuggestions([]); }}
              >
                <X size={14} />
              </button>
            )}

            {/* Geocoding suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionRef} className="suggestions-dropdown glass-panel">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={`suggestion-${idx}`}
                    type="button"
                    className="suggestion-item"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <MapPin size={12} className="--mr" />
                    <span>
                      {suggestion.name}
                      {suggestion.state ? `, ${suggestion.state}` : ""}
                      {` (${suggestion.country})`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Action buttons */}
          <div className="action-buttons">
            <button
              onClick={handleGeolocationClick}
              className="action-btn icon-btn"
              title="Use current location"
              aria-label="Use current location"
            >
              <MapPin size={18} />
            </button>
            
            <div ref={historyRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`action-btn icon-btn ${showHistory ? "active" : ""}`}
                title="Search history"
                aria-label="Search history"
              >
                <History size={18} />
              </button>

              {/* History Dropdown Overlay */}
              {showHistory && (
                <div className="history-dropdown-card glass-panel">
                  <SearchHistory
                    history={history}
                    onSelect={handleHistorySelect}
                    onRemove={removeHistoryItem}
                    onClearAll={clearHistory}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Display Loaders, Errors, or Main Weather Panels */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : errorMsg ? (
          <div className="error-card glass-panel --my2">
            <AlertTriangle size={36} className="error-icon" />
            <h3>Location Error</h3>
            <p>{errorMsg}</p>
            <button 
              onClick={() => loadWeatherData(defaultCity)}
              className="--btn --btn-secondary --my"
            >
              Reset to default
            </button>
          </div>
        ) : currentWeather && forecast ? (
          <div className="weather-data-wrap animate-fade-in">
            {/* Header info */}
            <div className="weather-title-area">
              <span className="current-date-badge">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <h2>
                {currentWeather.name}, {currentWeather.sys.country}
              </h2>
            </div>

            {/* Current temperature and general weather condition */}
            <div className="current-weather-row">
              <div className="temp-badge-wrap">
                <span className="temp-number">
                  {Math.round(currentWeather.main.temp)}
                </span>
                <span className="temp-unit">°C</span>
              </div>
              <div className="weather-desc-card">
                <img
                  src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                  alt={currentWeather.weather[0].main}
                  className="weather-condition-icon"
                />
                <div className="condition-texts">
                  <h3 className="--capitalize">{currentWeather.weather[0].main}</h3>
                  <span className="condition-desc --capitalize">
                    {currentWeather.weather[0].description}
                  </span>
                </div>
              </div>
            </div>

            {/* Weather parameters cards grid */}
            <div className="weather-details-grid --my2">
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrap bg-blue-tint">
                  <Thermometer size={18} />
                </div>
                <div className="stat-texts">
                  <span className="stat-label">Feels Like</span>
                  <span className="stat-value">
                    {Math.round(currentWeather.main.feels_like)}°C
                  </span>
                </div>
              </div>

              <div className="stat-card glass-panel">
                <div className="stat-icon-wrap bg-cyan-tint">
                  <Wind size={18} />
                </div>
                <div className="stat-texts">
                  <span className="stat-label">Wind Speed</span>
                  <span className="stat-value">{currentWeather.wind.speed} m/s</span>
                </div>
              </div>

              <div className="stat-card glass-panel">
                <div className="stat-icon-wrap bg-teal-tint">
                  <Droplets size={18} />
                </div>
                <div className="stat-texts">
                  <span className="stat-label">Humidity</span>
                  <span className="stat-value">{currentWeather.main.humidity}%</span>
                </div>
              </div>

              <div className="stat-card glass-panel">
                <div className="stat-icon-wrap bg-purple-tint">
                  <Gauge size={18} />
                </div>
                <div className="stat-texts">
                  <span className="stat-label">Pressure</span>
                  <span className="stat-value">{currentWeather.main.pressure} hPa</span>
                </div>
              </div>
            </div>

            {/* Trends Chart */}
            <WeatherChart forecastList={forecast.list} />

            {/* 5-Day Forecast Summary */}
            <div className="forecast-section --my2">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {getDailyForecasts(forecast.list).map((item, idx) => (
                  <div key={`forecast-day-${idx}`} className="forecast-card glass-panel">
                    <span className="forecast-day-name">{formatDay(item.dt_txt)}</span>
                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                      alt={item.weather[0].main}
                    />
                    <span className="forecast-cond --capitalize">
                      {item.weather[0].main}
                    </span>
                    <div className="forecast-temp-range">
                      <span className="temp-max">{Math.round(item.main.temp_max)}°</span>
                      <span className="temp-min">{Math.round(item.main.temp_min)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};

export default Dashboard;
