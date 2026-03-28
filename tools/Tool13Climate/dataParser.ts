import { DailyWeatherData } from './climateTypes';

export function parseWeatherCSV(csvText: string): DailyWeatherData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const data: DailyWeatherData[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length >= 4) {
      data.push({
        date: cols[0],
        tmax: parseFloat(cols[1]),
        tmin: parseFloat(cols[2]),
        sunshineHours: parseFloat(cols[3]),
        dayLength: cols[4] ? parseFloat(cols[4]) : 12 // Default to 12 if not provided
      });
    }
  }
  return data;
}
