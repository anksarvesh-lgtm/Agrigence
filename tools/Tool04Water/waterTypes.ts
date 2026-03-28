
export interface WeatherData {
  tMax: number;
  tMin: number;
  rh: number;
  windSpeed: number;
  solarRad: number;
  rainfall: number;
}

export interface CropConfig {
  type: string;
  plantingDate: string;
  stage: 'initial' | 'mid' | 'late';
}

export interface SoilConfig {
  type: 'Sandy' | 'Loam' | 'Clay';
  rootDepth: number;
  allowableDepletion: number;
}

export interface IrrigationSystem {
  name: string;
  efficiency: number;
}

export interface WaterResult {
  eto: number;
  etc: number;
  taw: number;
  raw: number;
  depletion: number;
  irrigationNeeded: number;
  grossIrrigation: number;
  warnings: string[];
}
