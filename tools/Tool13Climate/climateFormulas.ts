export function calculateGDD(tmax: number, tmin: number, tbase: number): number {
  const avg = (tmax + tmin) / 2;
  return Math.max(avg - tbase, 0);
}

export function calculatePTU(gdd: number, dayLength: number): number {
  return gdd * dayLength;
}

export function calculateHTU(gdd: number, sunshine: number): number {
  return gdd * sunshine;
}

export function calculateHUE(yieldKg: number, cumGDD: number): number {
  if (cumGDD === 0) return 0;
  return yieldKg / cumGDD;
}
