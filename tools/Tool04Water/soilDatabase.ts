
import { SoilConfig } from './waterTypes';

export const SOIL_DATABASE: Record<string, { taw: number }> = {
  'Sandy': { taw: 120 }, // mm/m
  'Loam': { taw: 180 },
  'Clay': { taw: 250 },
  'Silt Loam': { taw: 200 },
  'Sandy Loam': { taw: 140 }
};

export function calculateTAW(soilType: string, rootDepth: number): number {
  const soil = SOIL_DATABASE[soilType] || SOIL_DATABASE['Loam'];
  return soil.taw * rootDepth; // mm
}

export function calculateRAW(taw: number, allowableDepletion: number): number {
  return taw * (allowableDepletion / 100);
}
