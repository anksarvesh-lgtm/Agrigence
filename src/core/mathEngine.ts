export const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

export const product = (arr: number[]): number => arr.reduce((a, b) => a * b, 1);

export const mean = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
};

export const variance = (arr: number[], sample: boolean = true): number => {
  if (arr.length <= (sample ? 1 : 0)) return 0;
  const m = mean(arr);
  const sqDiff = arr.map(x => Math.pow(x - m, 2));
  return sum(sqDiff) / (arr.length - (sample ? 1 : 0));
};

export const stdDev = (arr: number[], sample: boolean = true): number => {
  return Math.sqrt(variance(arr, sample));
};

export const median = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

export const zScore = (val: number, mean: number, stdDev: number): number => {
  if (stdDev === 0) return 0;
  return (val - mean) / stdDev;
};
