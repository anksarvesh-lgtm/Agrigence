/**
 * Basic statistical utilities for agronomic research data.
 */

export interface StatsResult {
  mean: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  n: number;
  correlation?: number;
  regression?: { slope: number; intercept: number; r2: number };
  fValue?: number;
  df?: number;
}

/**
 * Calculates the mean of an array of numbers, filtering out NaN and non-number values.
 */
export const calculateRowMean = (values: number[]): number => {
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (!valid.length) return 0;

  const sum = valid.reduce((a, b) => a + b, 0);
  return sum / valid.length;
};

export const calculateBasicStats = (data: number[]): StatsResult => {
  const valid = data.filter(v => typeof v === 'number' && !isNaN(v));
  const n = valid.length;
  if (n === 0) return { mean: 0, stdDev: 0, variance: 0, min: 0, max: 0, n: 0 };
  const mean = valid.reduce((a, b) => a + b, 0) / n;
  const variance = valid.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  return {
    mean,
    stdDev,
    variance,
    min: Math.min(...valid),
    max: Math.max(...valid),
    n
  };
};

export const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const num = x.slice(0, n).reduce((acc, val, i) => acc + (val - meanX) * (y[i] - meanY), 0);
  const den = Math.sqrt(
    x.slice(0, n).reduce((acc, val) => acc + Math.pow(val - meanX, 2), 0) *
    y.slice(0, n).reduce((acc, val) => acc + Math.pow(val - meanY, 2), 0)
  );
  return den === 0 ? 0 : num / den;
};

export const calculateRegression = (x: number[], y: number[]) => {
  const n = Math.min(x.length, y.length);
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const num = x.slice(0, n).reduce((acc, val, i) => acc + (val - meanX) * (y[i] - meanY), 0);
  const den = x.slice(0, n).reduce((acc, val) => acc + Math.pow(val - meanX, 2), 0);
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  const r = calculateCorrelation(x, y);
  return { slope, intercept, r2: r * r };
};

export const calculateOneWayAnova = (groups: number[][]) => {
  const allData = groups.flat().filter(v => !isNaN(v));
  if (allData.length < 2 || groups.length < 2) return { fValue: 0, dfBetween: 0, dfWithin: 0 };
  
  const grandMean = allData.reduce((a, b) => a + b, 0) / allData.length;
  const ssTotal = allData.reduce((acc, val) => acc + Math.pow(val - grandMean, 2), 0);
  
  let ssBetween = 0;
  groups.forEach(group => {
    const validGroup = group.filter(v => !isNaN(v));
    if (validGroup.length > 0) {
      const groupMean = validGroup.reduce((a, b) => a + b, 0) / validGroup.length;
      ssBetween += validGroup.length * Math.pow(groupMean - grandMean, 2);
    }
  });
  
  const ssWithin = ssTotal - ssBetween;
  const dfBetween = groups.length - 1;
  const dfWithin = allData.length - groups.length;
  
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  
  const fValue = msWithin === 0 ? 0 : msBetween / msWithin;
  
  return { fValue, dfBetween, dfWithin };
};

/**
 * Calculates the standard deviation of an array of numbers.
 */
export const calculateStandardDeviation = (values: number[]): number => {
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (valid.length < 2) return 0;

  const mean = calculateRowMean(valid);
  const squareDiffs = valid.map(v => Math.pow(v - mean, 2));
  const avgSquareDiff = calculateRowMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

/**
 * Calculates the Coefficient of Variation (CV%)
 */
export const calculateCV = (values: number[]): number => {
  const mean = calculateRowMean(values);
  if (mean === 0) return 0;
  const sd = calculateStandardDeviation(values);
  return (sd / mean) * 100;
};
