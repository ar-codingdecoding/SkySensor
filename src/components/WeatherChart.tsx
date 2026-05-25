import React, { useState } from "react";
import { ForecastItem } from "../types/weather";

interface WeatherChartProps {
  forecastList: ForecastItem[];
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ forecastList }) => {
  const [activeTab, setActiveTab] = useState<"temp" | "humidity">("temp");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group forecasts by day and take midday (12:00) forecast
  const dailyData = forecastList.filter((item) => item.dt_txt.includes("12:00:00"));
  
  // Fallback if no 12:00 forecasts exist
  const displayData = dailyData.length > 0 
    ? dailyData 
    : forecastList.filter((_, idx) => idx % 8 === 0).slice(0, 5);

  if (displayData.length === 0) return null;

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr.replace(/-/g, "/"));
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Dimensions
  const width = 500;
  const height = 200;
  const paddingX = 45;
  const paddingY = 30;

  // Temperature Math
  const temps = displayData.map((d) => d.main.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempMinBound = minTemp - 2;
  const tempMaxBound = maxTemp + 2;
  const tempBoundRange = tempMaxBound - tempMinBound;

  // Coordinate calculators
  const getX = (index: number) => {
    const spacing = (width - paddingX * 2) / (displayData.length - 1);
    return paddingX + index * spacing;
  };

  const getTempY = (temp: number) => {
    const chartHeight = height - paddingY * 2;
    const ratio = (temp - tempMinBound) / tempBoundRange;
    return height - paddingY - ratio * chartHeight;
  };

  const getHumidityY = (humidity: number) => {
    const chartHeight = height - paddingY * 2;
    const ratio = humidity / 100;
    return height - paddingY - ratio * chartHeight;
  };

  // Generate SVG Path for Temp (Smooth Curve)
  let linePath = "";
  let areaPath = "";
  if (activeTab === "temp") {
    const points = displayData.map((d, i) => ({ x: getX(i), y: getTempY(d.main.temp) }));
    
    // Create quadratic/bezier curves for smooth rendering
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      linePath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    // Connect area path to the bottom of chart
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  return (
    <div className="chart-card glass-panel --my2">
      <div className="chart-header --flex-between">
        <h3>Trends Dashboard</h3>
        <div className="chart-tabs">
          <button
            className={`tab-btn ${activeTab === "temp" ? "active" : ""}`}
            onClick={() => setActiveTab("temp")}
          >
            Temperature
          </button>
          <button
            className={`tab-btn ${activeTab === "humidity" ? "active" : ""}`}
            onClick={() => setActiveTab("humidity")}
          >
            Humidity
          </button>
        </div>
      </div>

      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            {/* Temperature Gradients */}
            <linearGradient id="tempLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff5e62" />
              <stop offset="100%" stopColor="#ff9966" />
            </linearGradient>
            <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5e62" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff9966" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Humidity Gradients */}
            <linearGradient id="humBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00c6ff" />
              <stop offset="100%" stopColor="#0072ff" />
            </linearGradient>
            <linearGradient id="humBarGradHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="var(--chart-grid)"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="var(--chart-grid)"
            strokeWidth="0.5"
            strokeDasharray="4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="var(--chart-grid)"
            strokeWidth="0.5"
            strokeDasharray="4"
          />

          {/* Line Chart Mode */}
          {activeTab === "temp" && (
            <>
              {/* Shaded Area */}
              <path d={areaPath} fill="url(#tempAreaGrad)" />
              
              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke="url(#tempLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {displayData.map((d, i) => {
                const cx = getX(i);
                const cy = getTempY(d.main.temp);
                const isHovered = hoveredIndex === i;

                return (
                  <g key={`temp-pt-${i}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 4}
                      fill="var(--chart-point-fill)"
                      stroke="#ff5e62"
                      strokeWidth={isHovered ? 3 : 2}
                      style={{ transition: "all 0.2s" }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    {/* Temp text */}
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      fill="var(--chart-text-primary)"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {Math.round(d.main.temp)}°C
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* Bar Chart Mode */}
          {activeTab === "humidity" && (
            <>
              {displayData.map((d, i) => {
                const x = getX(i);
                const barWidth = 24;
                const humY = getHumidityY(d.main.humidity);
                const barHeight = height - paddingY - humY;
                const isHovered = hoveredIndex === i;

                return (
                  <g key={`hum-bar-${i}`}>
                    <rect
                      x={x - barWidth / 2}
                      y={humY}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={isHovered ? "url(#humBarGradHover)" : "url(#humBarGrad)"}
                      style={{ transition: "all 0.2s cursor pointer" }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    {/* Humidity Text */}
                    <text
                      x={x}
                      y={humY - 8}
                      textAnchor="middle"
                      fill="var(--chart-text-primary)"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {d.main.humidity}%
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* Shared X Axis (Days) */}
          {displayData.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;
            return (
              <g key={`axis-x-${i}`}>
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fill={isHovered ? "var(--chart-text-active)" : "var(--chart-text-secondary)"}
                  fontSize="11"
                  fontWeight={isHovered ? "600" : "500"}
                  style={{ transition: "fill 0.2s" }}
                >
                  {getDayName(d.dt_txt)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail Overlay of Selected Day */}
      <div className="chart-tooltip-area">
        {hoveredIndex !== null ? (
          <div className="chart-summary-line --text-sm">
            <strong>{new Date(displayData[hoveredIndex].dt_txt.replace(/-/g, "/")).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</strong>:{" "}
            <span>Temp: {Math.round(displayData[hoveredIndex].main.temp)}°C</span> |{" "}
            <span>Humidity: {displayData[hoveredIndex].main.humidity}%</span> |{" "}
            <span className="--capitalize">Condition: {displayData[hoveredIndex].weather[0].description}</span>
          </div>
        ) : (
          <div className="chart-summary-line --text-sm text-dim">
            Hover over elements in the chart to view detailed reports.
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherChart;
