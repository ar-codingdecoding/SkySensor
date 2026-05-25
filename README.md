# 🌤️ SkySensor - Advanced Weather Intelligence Dashboard

A beautiful, high-performance weather intelligence application built with **React**, **TypeScript**, and **Vite**. Featuring a premium glassmorphic dashboard design, local caching, search suggestions, interactive forecast charts, geolocation support, search history tracking, and dynamic weather animations.

---

## 🌟 Key Features

* **🎭 Dynamic Weather Scenes**: Dynamically changes the container's background image to match the city's current conditions. It is overlaid with GPU-accelerated particle effects:
  * *Rain / Drizzle*: Streams of falling rain drops.
  * *Snow*: Swirling, swaying white snowflakes.
  * *Thunderstorm*: Random screen flashes simulating lightning.
  * *Clouds*: Drifting volumetric clouds.
  * *Mist / Fog*: Slow, sweeping low-visibility fog layers.
  * *Clear / Sunny*: Warm sun glow and pulsing ray flares.
* **📊 SVG Trends Dashboard**: An interactive, responsive custom SVG chart visualization.
  * *Temperature Line*: Smooth bezier curve trend lines with gradient area shading.
  * *Humidity Bars*: Color-gradient vertical bar indicators.
  * *Hover Details*: Hovering over points/bars overlays date-specific statistics at the bottom of the card.
* **📂 Search History Drawer**: Quick-access history list of recently searched cities (caps at 8 items). Supports selecting a city to re-fetch weather, deleting specific cities, or clearing all. Saves state in `localStorage`.
* **🔍 Debounced Autocomplete suggestions**: Search queries are debounced by **350ms** and request matching suggestions from the OpenWeather Geocoding API, letting users pick coordinate-precise locations from a list.
* **🧭 Integrated Geolocation**: Automatically detects and loads local weather on initial page load, with a manual button to query location coordinates on demand.
* **👥 Comparison Mode**: Supports side-by-side city widgets on desktop. Click **Compare Cities** in the navbar to open a secondary city panel with its own search history, backgrounds, and charts.
* **⚡ API Caching**: Automatically stores API results in `localStorage` with a **10-minute expiration**. Subsequent requests for the same city or coordinates load instantly from the cache, preventing redundant network requests.
* **🌓 Dark & Light Themes**: Sleek contrast theme toggles for navbar, backgrounds, typography, and SVG charts. Remembers your theme choice between sessions.
* **⏳ Loading Skeletons**: Modern glassmorphic pulsing loader panels prevent layout shifts when retrieving weather information.

---

## 🛠️ Technology Stack

* **Core Framework**: React 18 (Hooks, functional components)
* **Type Safety**: TypeScript 5.x (Strict compilation)
* **Build System**: Vite (Optimized production bundling)
* **Styling**: Vanilla CSS (Glassmorphism, custom keyframes, variables)
* **Icons**: Lucide React

---

## 🚀 Installation & Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* npm (v8+ recommended)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ar-codingdecoding/WeatherReport.git
   cd WeatherReport
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Verify TypeScript & Build**:
   ```bash
   # Typecheck
   npx tsc --noEmit
   
   # Build optimized bundle
   npm run build
   ```
   The production-ready assets will be generated in the `/dist` folder.

---

## 🤝 Contact
Developed by [ar-codingdecoding](https://github.com/ar-codingdecoding).
