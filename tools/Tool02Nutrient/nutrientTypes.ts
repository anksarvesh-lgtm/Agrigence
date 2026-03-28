
export type SoilType = 'Alluvial' | 'Black' | 'Red' | 'Laterite' | 'Other';
export type PreviousCrop = 'Legume' | 'Cereal' | 'Oilseed' | 'Other';
export type Season = 'Kharif' | 'Rabi' | 'Zaid';

export interface SoilTestData {
  availableN: number;
  availableP: number;
  availableK: number;
  pH: number;
  organicCarbon: number;
  soilType: SoilType;
  previousCrop: PreviousCrop;
}

export interface CropTarget {
  cropName: string;
  targetYield: number;
  season: Season;
}

export interface FertilizerMaterial {
  id: string;
  name: string;
  category: 'Chemical' | 'Organic';
  N: number;
  P: number;
  K: number;
  efficiency: number;
}

export interface SelectedMaterial {
  id: string;
  material: FertilizerMaterial;
  qty: number;
  price: number;
}

export interface NutrientResult {
  required: { N: number; P: number; K: number };
  supplied: { N: number; P: number; K: number };
  gap: { N: number; P: number; K: number };
  cost: number;
  warnings: string[];
}
