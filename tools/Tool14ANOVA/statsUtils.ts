// Simple t-value lookup for alpha = 0.05 (two-tailed)
const tTable05: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
  6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
  16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
  21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
  26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
  40: 2.021, 60: 2.000, 120: 1.980
};

export function getTValue(df: number): number {
  if (df <= 0) return 1.96;
  if (tTable05[df]) return tTable05[df];
  if (df > 120) return 1.96;
  
  const keys = Object.keys(tTable05).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length; i++) {
    if (df < keys[i]) {
      return tTable05[keys[i > 0 ? i - 1 : 0]];
    }
  }
  return 1.96;
}

export function getFCrit(df1: number, df2: number): number {
  // Simplified F-table at alpha=0.05
  const fTable: Record<number, Record<number, number>> = {
    1: { 1: 161.4, 2: 18.51, 3: 10.13, 4: 7.71, 5: 6.61, 10: 4.96, 20: 4.35, 100: 3.92 },
    2: { 1: 199.5, 2: 19.00, 3: 9.55, 4: 6.94, 5: 5.79, 10: 4.10, 20: 3.49, 100: 3.09 },
    3: { 1: 215.7, 2: 19.16, 3: 9.28, 4: 6.59, 5: 5.41, 10: 3.71, 20: 3.10, 100: 2.70 },
    4: { 1: 224.6, 2: 19.25, 3: 9.12, 4: 6.39, 5: 5.19, 10: 3.48, 20: 2.87, 100: 2.46 },
    5: { 1: 230.2, 2: 19.30, 3: 9.01, 4: 6.26, 5: 5.05, 10: 3.33, 20: 2.71, 100: 2.31 }
  };
  
  const d1 = df1 > 5 ? 5 : df1;
  const d2Keys = [1, 2, 3, 4, 5, 10, 20, 100];
  let d2 = 100;
  for (let k of d2Keys) {
    if (df2 <= k) {
      d2 = k;
      break;
    }
  }
  
  return fTable[d1]?.[d2] || 3.0; // Fallback
}
