import React from "react";

interface WeatherEffectsProps {
  condition: string;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ condition }) => {
  if (!condition) return null;
  const cond = condition.toLowerCase();

  // Thunderstorm
  if (cond.includes("thunder")) {
    return (
      <div className="weather-effect thunder-effect" aria-hidden="true">
        <div className="lightning-flash" />
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`thunder-rain-${i}`}
            className="rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              animationDuration: `${0.6 + Math.random() * 0.4}s`,
              opacity: 0.2 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  // Rain / Drizzle
  if (cond.includes("rain") || cond.includes("drizzle")) {
    return (
      <div className="weather-effect rain-effect" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`rain-${i}`}
            className="rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.8 + Math.random() * 0.6}s`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  // Snow
  if (cond.includes("snow") || cond.includes("cold")) {
    return (
      <div className="weather-effect snow-effect" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`snow-${i}`}
            className="snow-flake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 5}s`,
              opacity: 0.3 + Math.random() * 0.6,
              transform: `scale(${0.4 + Math.random() * 0.7})`,
            }}
          />
        ))}
      </div>
    );
  }

  // Clouds
  if (cond.includes("cloud")) {
    return (
      <div className="weather-effect clouds-effect" aria-hidden="true">
        <div className="cloud-particle cloud-1" />
        <div className="cloud-particle cloud-2" />
        <div className="cloud-particle cloud-3" />
      </div>
    );
  }

  // Mist / Haze / Fog / Dust / Smoke
  if (
    cond.includes("mist") ||
    cond.includes("haze") ||
    cond.includes("fog") ||
    cond.includes("smoke") ||
    cond.includes("dust") ||
    cond.includes("ash")
  ) {
    return (
      <div className="weather-effect mist-effect" aria-hidden="true">
        <div className="mist-layer mist-1" />
        <div className="mist-layer mist-2" />
      </div>
    );
  }

  // Clear / Sunny
  if (cond.includes("clear") || cond.includes("sun")) {
    return (
      <div className="weather-effect sunny-effect" aria-hidden="true">
        <div className="sun-glow" />
        <div className="sun-rays" />
      </div>
    );
  }

  return null;
};

export default WeatherEffects;
