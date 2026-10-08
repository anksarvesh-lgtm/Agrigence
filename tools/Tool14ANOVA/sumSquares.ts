export function grandMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function totalSS(values: number[], gm: number): number {
  return values.reduce((s, v) => s + Math.pow(v - gm, 2), 0);
}

export function treatmentSS(treatmentMeans: Record<string, number>, rep: number, gm: number): number {
  let ss = 0;
  for (const t in treatmentMeans) {
    ss += rep * Math.pow(treatmentMeans[t] - gm, 2);
  }
  return ss;
}

export function blockSS(blockMeans: Record<string, number>, numTreatments: number, gm: number): number {
  let ss = 0;
  for (const b in blockMeans) {
    ss += numTreatments * Math.pow(blockMeans[b] - gm, 2);
  }
  return ss;
}
