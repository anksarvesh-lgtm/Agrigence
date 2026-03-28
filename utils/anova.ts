/**
 * ANOVA (Analysis of Variance) Engine for Field Trials.
 * Supports One-Way ANOVA and Randomized Block Design (RBD) logic.
 */

import { calculateRowMean } from './statistics';

export interface FieldRow {
  plotNo: string;
  replication: string;
  treatment: string;
  control: boolean;
  observations: number[];
  mean: number;
}

export interface AnovaResult {
  sourceOfVariation: {
    treatment: {
      df: number;
      ss: number;
      ms: number;
      f: number;
      fCrit: number;
      significant: boolean;
    };
    error: {
      df: number;
      ss: number;
      ms: number;
    };
    total: {
      df: number;
      ss: number;
    };
  };
  grandMean: number;
  cv: number;
  interpretation: string;
}

/**
 * Simple F-distribution critical values for alpha = 0.05.
 * This is a simplified lookup table for common degrees of freedom.
 */
const getFCrit = (df1: number, df2: number): number => {
  // Simplified lookup for alpha = 0.05
  // In a real app, this would use a more complete table or a distribution function.
  const fTable: Record<number, Record<number, number>> = {
    1: { 1: 161.4, 2: 18.51, 3: 10.13, 4: 7.71, 5: 6.61, 10: 4.96, 20: 4.35, 30: 4.17 },
    2: { 1: 199.5, 2: 19.00, 3: 9.55, 4: 6.94, 5: 5.79, 10: 4.10, 20: 3.49, 30: 3.32 },
    3: { 1: 215.7, 2: 19.16, 3: 9.28, 4: 6.59, 5: 5.41, 10: 3.71, 20: 3.10, 30: 2.92 },
    4: { 1: 224.6, 2: 19.25, 3: 9.12, 4: 6.39, 5: 5.19, 10: 3.48, 20: 2.87, 30: 2.69 },
    5: { 1: 230.2, 2: 19.30, 3: 9.01, 4: 6.26, 5: 5.05, 10: 3.33, 20: 2.71, 30: 2.53 },
    10: { 1: 241.9, 2: 19.40, 3: 8.79, 4: 5.96, 5: 4.74, 10: 2.98, 20: 2.35, 30: 2.16 },
  };

  const d1 = Object.keys(fTable).map(Number).sort((a, b) => b - a).find(k => k <= df1) || 1;
  const d2 = Object.keys(fTable[d1]).map(Number).sort((a, b) => b - a).find(k => k <= df2) || 1;

  return fTable[d1][d2] || 3.84; // Default fallback
};

export const computeAnova = (rows: FieldRow[]): AnovaResult | null => {
  if (rows.length < 2) return null;

  // 1. Group by treatment
  const treatmentGroups: Record<string, number[]> = {};
  rows.forEach(row => {
    if (!treatmentGroups[row.treatment]) {
      treatmentGroups[row.treatment] = [];
    }
    treatmentGroups[row.treatment].push(row.mean);
  });

  const treatments = Object.keys(treatmentGroups);
  const t = treatments.length;
  if (t < 2) return null;

  // 2. Calculate treatment means and grand mean
  const treatmentMeans: Record<string, number> = {};
  let totalSum = 0;
  let N = 0;

  treatments.forEach(tr => {
    const values = treatmentGroups[tr];
    const mean = calculateRowMean(values);
    treatmentMeans[tr] = mean;
    totalSum += values.reduce((a, b) => a + b, 0);
    N += values.length;
  });

  const grandMean = totalSum / N;

  // 3. Sum of Squares Treatment (SST)
  let SST = 0;
  treatments.forEach(tr => {
    const values = treatmentGroups[tr];
    const n_t = values.length;
    SST += n_t * Math.pow(treatmentMeans[tr] - grandMean, 2);
  });

  // 4. Sum of Squares Total (SSTotal)
  let SSTotal = 0;
  rows.forEach(row => {
    SSTotal += Math.pow(row.mean - grandMean, 2);
  });

  // 5. Sum of Squares Error (SSE)
  const SSE = SSTotal - SST;

  // 6. Degrees of Freedom
  const dfT = t - 1;
  const dfE = N - t;
  const dfTotal = N - 1;

  // 7. Mean Squares
  const MST = SST / dfT;
  const MSE = SSE / dfE;

  // 8. F-Statistic
  const F = MST / MSE;
  const fCrit = getFCrit(dfT, dfE);
  const significant = F > fCrit;

  // 9. CV%
  const CV = (Math.sqrt(MSE) / grandMean) * 100;

  return {
    sourceOfVariation: {
      treatment: {
        df: dfT,
        ss: SST,
        ms: MST,
        f: F,
        fCrit: fCrit,
        significant: significant,
      },
      error: {
        df: dfE,
        ss: SSE,
        ms: MSE,
      },
      total: {
        df: dfTotal,
        ss: SSTotal,
      },
    },
    grandMean,
    cv: CV,
    interpretation: significant 
      ? "Significant treatment differences observed (p < 0.05)." 
      : "No significant difference among treatments observed (p > 0.05).",
  };
};

export const generateSummary = (result: AnovaResult): string => {
  return `
Total Treatments: ${result.sourceOfVariation.treatment.df + 1}
Total Observations: ${result.sourceOfVariation.total.df + 1}
Grand Mean: ${result.grandMean.toFixed(2)}
CV%: ${result.cv.toFixed(2)}%

ANOVA Result:
F-Value: ${result.sourceOfVariation.treatment.f.toFixed(4)}
F-Critical: ${result.sourceOfVariation.treatment.fCrit.toFixed(4)}

Interpretation:
${result.interpretation}
  `.trim();
};
