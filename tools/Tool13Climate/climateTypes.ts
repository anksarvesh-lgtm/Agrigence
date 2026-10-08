export interface DailyWeatherData {
  date: string;
  tmax: number;
  tmin: number;
  sunshineHours: number;
  dayLength: number;
}

export interface CropInfo {
  name: string;
  plantingDate: string;
  tbase: number;
  yieldKg?: number;
}

export interface PhenologyStage {
  stage: string;
  gddThreshold: number;
  expectedDate?: string;
  accumulatedGDD?: number;
}

export interface ClimateAnalysisResult {
  totalGDD: number;
  totalPTU: number;
  totalHTU: number;
  hue?: number;
  stressReport: {
    heatStressDays: number;
    coldStressDays: number;
    thermalDeviation: number;
  };
  phenologyProgression: PhenologyStage[];
}
