
export type CropType = 'Wheat' | 'Rice' | 'Maize' | 'Barley' | 'Other';
export type AreaUnit = 'Hectare' | 'Acre' | 'Bigha';

export interface SeedRateInput {
  seedLotName?: string;
  purity: number;
  germination: number;
  hardSeed: number;
  tgWeight: number;
  targetPopulation: number;
  emergence: number;
  cropType: CropType;
  pricePerKg: number;
  fieldArea: number;
  areaUnit: AreaUnit;
}

export interface SeedRateResult {
  pls: number;
  bulkRequired: number;
  costPerPLS: number;
  sowingRate: number;
  adjustedSowingRate: number;
  totalSeed: number;
  warnings: string[];
}
