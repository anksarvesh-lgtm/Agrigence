
import { IrrigationSystem } from './waterTypes';

export function calculateGrossIrrigation(netIrrigation: number, systemEfficiency: number): number {
  return netIrrigation / (systemEfficiency / 100);
}

export function estimatePumpHours(volumeM3: number, flowRateLPS: number): number {
  // Volume in m3, Flow in L/s
  // 1 m3 = 1000 L
  // Hours = (Volume * 1000) / (Flow * 3600)
  return (volumeM3 * 1000) / (flowRateLPS * 3600);
}
