
export const KC_VALUES: Record<string, { initial: number; mid: number; late: number }> = {
  'Wheat': { initial: 0.4, mid: 1.15, late: 0.3 },
  'Rice': { initial: 1.05, mid: 1.2, late: 0.9 },
  'Maize': { initial: 0.5, mid: 1.2, late: 0.6 },
  'Cotton': { initial: 0.35, mid: 1.2, late: 0.6 },
  'Potato': { initial: 0.5, mid: 1.15, late: 0.75 },
  'Tomato': { initial: 0.6, mid: 1.15, late: 0.8 },
  'Sugarcane': { initial: 0.4, mid: 1.25, late: 0.75 }
};

export function getEtc(eto: number, kc: number) {
  return eto * kc;
}
