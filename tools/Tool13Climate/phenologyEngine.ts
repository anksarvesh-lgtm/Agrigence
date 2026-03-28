import { DailyWeatherData, PhenologyStage } from './climateTypes';
import { calculateGDD } from './climateFormulas';

const CROP_STAGES: Record<string, Record<string, number>> = {
  'Wheat': {
    'Germination': 120,
    'Tillering': 450,
    'Flowering': 900,
    'Maturity': 1500
  },
  'Rice': {
    'Germination': 150,
    'Seedling': 400,
    'Panicle Initiation': 850,
    'Flowering': 1100,
    'Maturity': 1800
  },
  'Maize': {
    'Emergence': 100,
    'V6 Stage': 400,
    'Tasseling': 800,
    'Silking': 950,
    'Maturity': 1600
  },
  'Cotton': {
    'Emergence': 150,
    'Squaring': 600,
    'Flowering': 1000,
    'Boll Opening': 1800,
    'Maturity': 2200
  }
};

export function trackPhenology(
  cropName: string, 
  weatherData: DailyWeatherData[], 
  tbase: number
): PhenologyStage[] {
  const cropThresholds = CROP_STAGES[cropName] || CROP_STAGES['Wheat'];
  const stages: PhenologyStage[] = Object.entries(cropThresholds).map(([stage, gddThreshold]) => ({
    stage,
    gddThreshold
  }));

  let accumulatedGDD = 0;
  const progression: PhenologyStage[] = [];

  stages.sort((a, b) => a.gddThreshold - b.gddThreshold);

  let stageIndex = 0;
  for (const day of weatherData) {
    const gdd = calculateGDD(day.tmax, day.tmin, tbase);
    accumulatedGDD += gdd;

    while (stageIndex < stages.length && accumulatedGDD >= stages[stageIndex].gddThreshold) {
      progression.push({
        ...stages[stageIndex],
        expectedDate: day.date,
        accumulatedGDD
      });
      stageIndex++;
    }
  }

  return progression;
}
