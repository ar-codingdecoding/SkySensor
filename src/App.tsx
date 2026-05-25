import React, { useState, useEffect } from "react";
import { Sun, Moon, Plus, Minus, CloudRainWind } from "lucide-react";
import Dashboard from "./components/Dashboard";
import { SearchHistoryItem } from "./types/weather";
import "./App.css";

export const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("weather_theme");
      return saved ? saved === "dark" : true; // default dark
    } catch {
      return true;
    }
  });

  const [compareMode, setCompareMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("weather_compare_mode");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("weather_search_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Apply theme class to body
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      localStorage.setItem("weather_theme", "dark");
    } else {
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      localStorage.setItem("weather_theme", "light");
    }
  }, [isDarkMode]);

  // Persist compare mode
  useEffect(() => {
    localStorage.setItem("weather_compare_mode", compareMode.toString());
  }, [compareMode]);

  // Persist history
  useEffect(() => {
    localStorage.setItem("weather_search_history", JSON.stringify(history));
  }, [history]);

  const addHistoryItem = (name: string, country: string, lat?: number, lon?: number) => {
    setHistory((prev) => {
      // Remove duplicates
      const filtered = prev.filter(
        (item) => !(item.name.toLowerCase() === name.toLowerCase() && item.country.toLowerCase() === country.toLowerCase())
      );
      
      const newItem: SearchHistoryItem = {
        id: `${name}-${country}-${Date.now()}`,
        name,
        country,
        lat,
        lon,
        timestamp: Date.now(),
      };
      
      // Limit to max 8 items
      return [newItem, ...filtered].slice(0, 8);
    });
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className={`app-shell ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      {/* Top Navbar */}
      <header className="app-navbar glass-panel">
        <div className="navbar-brand --flex-center">
          <CloudRainWind className="brand-logo" size={24} />
          <h1>SkySensor</h1>
        </div>

        <div className="navbar-actions">
          {/* Compare toggle button */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`navbar-btn compare-toggle --flex-center ${compareMode ? "active" : ""}`}
            title={compareMode ? "Single City View" : "Compare Two Cities"}
          >
            {compareMode ? (
              <>
                <Minus size={16} className="--mr" />
                <span>Single View</span>
              </>
            ) : (
              <>
                <Plus size={16} className="--mr" />
                <span>Compare Cities</span>
              </>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="navbar-btn theme-toggle icon-btn"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Theme toggle"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Layout containing Dashboards */}
      <main className={`app-main ${compareMode ? "comparison-layout" : "single-layout"}`}>
        <div className="dashboard-wrapper">
          <Dashboard
            id="panel-1"
            defaultCity="New York"
            history={history}
            addHistoryItem={addHistoryItem}
            removeHistoryItem={removeHistoryItem}
            clearHistory={clearHistory}
          />
        </div>
        
        {compareMode && (
          <div className="dashboard-wrapper animate-slide-in">
            <Dashboard
              id="panel-2"
              defaultCity="London"
              history={history}
              addHistoryItem={addHistoryItem}
              removeHistoryItem={removeHistoryItem}
              clearHistory={clearHistory}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
