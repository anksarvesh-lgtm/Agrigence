import { DailyWeatherData } from './climateTypes';

export function analyzeStress(weatherData: DailyWeatherData[]) {
  let heatStressDays = 0;
  let coldStressDays = 0;
  let totalTemp = 0;

  weatherData.forEach(day => {
    if (day.tmax > 35) heatStressDays++;
    if (day.tmin < 5) coldStressDays++;
    totalTemp += (day.tmax + day.tmin) / 2;
  });

  const avgTemp = totalTemp / (weatherData.length || 1);
  // Thermal deviation index (simple version: sum of absolute deviations from mean)
  let thermalDeviation = 0;
  weatherData.forEach(day => {
    thermalDeviation += Math.abs(((day.tmax + day.tmin) / 2) - avgTemp);
  });

  return {
    heatStressDays,
    coldStressDays,
    thermalDeviation: thermalDeviation / (weatherData.length || 1)
  };
}
