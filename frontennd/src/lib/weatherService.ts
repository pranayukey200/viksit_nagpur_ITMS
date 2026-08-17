/**
 * Live Web Weather Service for Nagpur & Surrounding 500km Region
 * Fetches real-time precipitation, temperature, humidity, and weather code from Open-Meteo API.
 */

export interface LiveWeatherData {
  tempC: number;
  humidity: number;
  rainMm: number;
  precipitation: number;
  weatherCode: number;
  condition: string;
  windSpeedKmH: number;
  lastUpdated: string;
  isLiveSynced: boolean;
}

/** Map WMO Weather Code to human readable condition */
export function interpretWeatherCode(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code === 1 || code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy / Mist";
  if (code >= 51 && code <= 55) return "Light Drizzle";
  if (code >= 61 && code <= 65) return "Rain Showers";
  if (code >= 80 && code <= 82) return "Heavy Rain Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm ⚡";
  return "Passing Showers";
}

/** Fetch live real-time weather from Open-Meteo API */
export async function fetchLiveNagpurWeather(): Promise<LiveWeatherData> {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch live weather");

    const data = await res.json();
    const curr = data.current;

    return {
      tempC: Math.round(curr.temperature_2m * 10) / 10,
      humidity: curr.relative_humidity_2m,
      rainMm: curr.precipitation || curr.rain || 0.1,
      precipitation: curr.precipitation || 0,
      weatherCode: curr.weather_code,
      condition: interpretWeatherCode(curr.weather_code),
      windSpeedKmH: Math.round(curr.wind_speed_10m),
      lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      isLiveSynced: true,
    };
  } catch (err) {
    console.warn("Live weather fetch fallback:", err);
    return {
      tempC: 25.4,
      humidity: 93,
      rainMm: 6.2,
      precipitation: 6.2,
      weatherCode: 61,
      condition: "Light Rain",
      windSpeedKmH: 12,
      lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      isLiveSynced: false,
    };
  }
}
