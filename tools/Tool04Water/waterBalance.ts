
import { WaterResult } from './waterTypes';

export function updateSoilWaterBalance(
  prevDepletion: number,
  etc: number,
  rainfall: number,
  irrigation: number,
  taw: number,
  raw: number
): { depletion: number; irrigationNeeded: number; warning?: string } {
  
  // Effective rainfall (simple method: 80% effective if > 5mm)
  const effRain = rainfall > 5 ? rainfall * 0.8 : 0;
  
  // Water balance: Depletion_today = Depletion_prev + ETc - Rain - Irrigation
  let currentDepletion = prevDepletion + etc - effRain - irrigation;
  
  // Depletion cannot be negative (soil at field capacity)
  if (currentDepletion < 0) {
    currentDepletion = 0; // Runoff / Deep percolation
  }
  
  // Depletion cannot exceed TAW (soil at permanent wilting point)
  let warning = undefined;
  if (currentDepletion > taw) {
    currentDepletion = taw;
    warning = "Crop Stress: Soil moisture below permanent wilting point!";
  } else if (currentDepletion > raw) {
    warning = "Water Stress: Depletion exceeds Readily Available Water.";
  }

  // Irrigation trigger: If depletion > RAW
  const irrigationNeeded = currentDepletion >= raw ? currentDepletion : 0;

  return { depletion: currentDepletion, irrigationNeeded, warning };
}
