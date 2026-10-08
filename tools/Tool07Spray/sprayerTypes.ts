
export type SprayerType = 'Backpack' | 'Boom' | 'Tractor' | 'Drone';

export interface SprayerConfig {
  type: SprayerType;
  tankCapacity: number; // Liters
  
  // Backpack specific
  coveragePerTank?: number; // m²
  
  // Boom/Tractor specific
  nozzleOutput?: number; // L/min
  travelSpeed?: number; // km/hr
  nozzleSpacing?: number; // cm
  numberOfNozzles?: number;
}

export interface ChemicalConfig {
  name: string;
  formulation: 'EC' | 'WP' | 'SC' | 'GR' | 'Other';
  recommendedDose: number; // ml/L or g/L
  activeIngredientPercent: number; // %
  maxAllowedDose: number; // ml/L or g/L
}

export interface FieldConfig {
  area: number; // hectares
  waterVolumeOverride?: number; // L/ha (optional)
}

export interface SprayPlan {
  sprayVolumePerHa: number; // L/ha
  totalWaterNeeded: number; // Liters
  totalProductRequired: number; // ml or g
  numberOfTanks: number;
  productPerTank: number; // ml or g
  sprayTimeEstimate: number; // minutes
  activeIngredientApplied: number; // ml or g
  validationMessage: string;
  validationStatus: 'SAFE' | 'WARNING' | 'DANGER';
}

export interface SafetyCard {
  ppe: string[];
  reEntryInterval: string;
  storage: string;
  toxicity: string;
}
