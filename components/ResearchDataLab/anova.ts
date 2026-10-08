export interface AnovaInput {
  title: string;
  treatments: string[];
  replications: string[];
  matrix: number[][]; // rows = treatments, cols = replications
}

export interface AnovaOutput {
  summary: {
    t: number;
    r: number;
    N: number;
    G: number;
    grand_mean: number;
  };
  ss: {
    CF: number;
    TSS: number;
    SS_treatment: number;
    SS_error: number;
  };
  df: {
    treatment: number;
    error: number;
    total: number;
  };
  ms: {
    treatment: number;
    error: number;
  };
  f_calculated: number;
  t_value: number;
  results: {
    SEm: number;
    SEd: number;
    CD_5pct: number | "NS";
    CV_pct: number;
  };
  treatment_means: number[];
  treatment_totals: number[];
  significance: "Significant" | "Non-Significant";
  cv_classification: "Excellent" | "Good" | "Moderate" | "Poor";
  steps: {
    step: string;
    name: string;
    formula: string;
    substitution: string;
    result: number | string;
  }[];
  treatment_comparison: {
    treatment_i: string;
    treatment_j: string;
    mean_i: number;
    mean_j: number;
    difference: number;
    significant: boolean;
  }[];
  error?: boolean;
  message?: string;
}

// t-table values at alpha = 0.05 (two-tailed)
const T_TABLE: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
  6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
  11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
  16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
  21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
  26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
  40: 2.021, 60: 2.000, 120: 1.980
};

function getTValue(df: number): number {
  if (T_TABLE[df]) return T_TABLE[df];
  
  // Linear interpolation for intermediate df
  const dfs = Object.keys(T_TABLE).map(Number).sort((a, b) => a - b);
  let lower = dfs[0];
  let upper = dfs[dfs.length - 1];
  
  if (df > upper) return 1.960; // Approaching infinity
  
  for (let i = 0; i < dfs.length - 1; i++) {
    if (df > dfs[i] && df < dfs[i+1]) {
      lower = dfs[i];
      upper = dfs[i+1];
      break;
    }
  }
  
  const t_lower = T_TABLE[lower];
  const t_upper = T_TABLE[upper];
  
  // Linear interpolation
  return t_lower + ((df - lower) * (t_upper - t_lower)) / (upper - lower);
}

// F-table values at alpha = 0.05 (approximate for significance check)
// In a real app, you'd want a more complete F-table or a function to calculate it.
// For this prompt, we'll use a simplified check or assume F > 1 is significant if it exceeds a basic threshold,
// but actually the prompt says: "If F_calculated > F_table (5%) -> Significant".
// We'll implement a basic F-table lookup for alpha=0.05
const F_TABLE_05: Record<number, Record<number, number>> = {
  // df1 (treatment) -> df2 (error) -> value
  1: { 1: 161.4, 2: 18.51, 3: 10.13, 4: 7.71, 5: 6.61, 6: 5.99, 7: 5.59, 8: 5.32, 9: 5.12, 10: 4.96, 12: 4.75, 15: 4.54, 20: 4.35, 30: 4.17, 60: 4.00 },
  2: { 1: 199.5, 2: 19.00, 3: 9.55, 4: 6.94, 5: 5.79, 6: 5.14, 7: 4.74, 8: 4.46, 9: 4.26, 10: 4.10, 12: 3.89, 15: 3.68, 20: 3.49, 30: 3.32, 60: 3.15 },
  3: { 1: 215.7, 2: 19.16, 3: 9.28, 4: 6.59, 5: 5.41, 6: 4.76, 7: 4.35, 8: 4.07, 9: 3.86, 10: 3.71, 12: 3.49, 15: 3.29, 20: 3.10, 30: 2.92, 60: 2.76 },
  4: { 1: 224.6, 2: 19.25, 3: 9.12, 4: 6.39, 5: 5.19, 6: 4.53, 7: 4.12, 8: 3.84, 9: 3.63, 10: 3.48, 12: 3.26, 15: 3.06, 20: 2.87, 30: 2.69, 60: 2.53 },
  5: { 1: 230.2, 2: 19.30, 3: 9.01, 4: 6.26, 5: 5.05, 6: 4.39, 7: 3.97, 8: 3.69, 9: 3.48, 10: 3.33, 12: 3.11, 15: 2.90, 20: 2.71, 30: 2.53, 60: 2.37 },
  6: { 1: 234.0, 2: 19.33, 3: 8.94, 4: 6.16, 5: 4.95, 6: 4.28, 7: 3.87, 8: 3.58, 9: 3.37, 10: 3.22, 12: 3.00, 15: 2.79, 20: 2.60, 30: 2.42, 60: 2.25 },
  7: { 1: 236.8, 2: 19.35, 3: 8.89, 4: 6.09, 5: 4.88, 6: 4.21, 7: 3.79, 8: 3.50, 9: 3.29, 10: 3.14, 12: 2.91, 15: 2.71, 20: 2.51, 30: 2.33, 60: 2.17 },
  8: { 1: 238.9, 2: 19.37, 3: 8.85, 4: 6.04, 5: 4.82, 6: 4.15, 7: 3.73, 8: 3.44, 9: 3.23, 10: 3.07, 12: 2.85, 15: 2.64, 20: 2.45, 30: 2.27, 60: 2.10 },
  9: { 1: 240.5, 2: 19.38, 3: 8.81, 4: 6.00, 5: 4.77, 6: 4.10, 7: 3.68, 8: 3.39, 9: 3.18, 10: 3.02, 12: 2.80, 15: 2.59, 20: 2.39, 30: 2.21, 60: 2.04 },
  10: { 1: 241.9, 2: 19.40, 3: 8.79, 4: 5.96, 5: 4.74, 6: 4.06, 7: 3.64, 8: 3.35, 9: 3.14, 10: 2.98, 12: 2.75, 15: 2.54, 20: 2.35, 30: 2.16, 60: 1.99 },
};

function getFValue(df1: number, df2: number): number {
  // Simple fallback logic for F-table
  let d1 = df1 > 10 ? 10 : df1;
  let d2 = df2;
  if (!F_TABLE_05[d1]) return 3.0; // fallback
  
  const d2Keys = Object.keys(F_TABLE_05[d1]).map(Number).sort((a, b) => a - b);
  let closestD2 = d2Keys[0];
  for (const k of d2Keys) {
    if (k <= df2) closestD2 = k;
    else break;
  }
  return F_TABLE_05[d1][closestD2] || 3.0;
}

export function calculateANOVA(input: AnovaInput): AnovaOutput {
  const { title, treatments, replications, matrix } = input;
  
  const t = treatments.length;
  const r = replications.length;
  
  // Validation
  if (t < 2) return { error: true, message: "Minimum 2 treatments required." } as any;
  if (r < 2) return { error: true, message: "Minimum 2 replications required." } as any;
  
  if (matrix.length !== t) return { error: true, message: "Matrix rows do not match number of treatments." } as any;
  
  for (let i = 0; i < t; i++) {
    if (matrix[i].length !== r) return { error: true, message: "Unequal replications per treatment. Check your file." } as any;
    for (let j = 0; j < r; j++) {
      if (typeof matrix[i][j] !== 'number' || isNaN(matrix[i][j])) {
        return { error: true, message: "All cells must be numeric." } as any;
      }
    }
  }

  const N = t * r;
  
  // Step 1: Grand Total & Grand Mean
  let G = 0;
  const treatment_totals = new Array(t).fill(0);
  let sum_yij_sq = 0;
  
  for (let i = 0; i < t; i++) {
    for (let j = 0; j < r; j++) {
      const val = matrix[i][j];
      treatment_totals[i] += val;
      G += val;
      sum_yij_sq += val * val;
    }
  }
  
  const grand_mean = G / N;
  if (grand_mean === 0) return { error: true, message: "Grand Mean must not be zero." } as any;
  
  const treatment_means = treatment_totals.map(tot => tot / r);

  // Step 2: Correction Factor
  const CF = (G * G) / N;

  // Step 3: Sum of Squares
  const TSS = sum_yij_sq - CF;
  
  let sum_Ti_sq_div_r = 0;
  for (let i = 0; i < t; i++) {
    sum_Ti_sq_div_r += (treatment_totals[i] * treatment_totals[i]) / r;
  }
  const SS_treatment = sum_Ti_sq_div_r - CF;
  const SS_error = TSS - SS_treatment;

  // Step 4: Degrees of Freedom
  const df_treatment = t - 1;
  const df_error = t * (r - 1);
  const df_total = (t * r) - 1;

  // Step 5: Mean Squares
  const MS_treatment = SS_treatment / df_treatment;
  const MS_error = SS_error / df_error;

  // Step 6: F Value
  const f_calculated = MS_treatment / MS_error;

  // Step 7: Standard Error of Mean
  const SEm = Math.sqrt(MS_error / r);

  // Step 8: Standard Error of Difference
  const SEd = Math.sqrt((2 * MS_error) / r);

  // Step 9: t-Table Value
  const t_value = getTValue(df_error);

  // Step 10: Critical Difference at 5%
  const CD_5pct = SEd * t_value;

  // Step 11: Coefficient of Variation
  const CV_pct = (Math.sqrt(MS_error) / grand_mean) * 100;

  // Significance
  const f_table = getFValue(df_treatment, df_error);
  const isSignificant = f_calculated > f_table;
  const significance = isSignificant ? "Significant" : "Non-Significant";
  const final_CD = isSignificant ? CD_5pct : "NS";

  // CV Classification
  let cv_classification: "Excellent" | "Good" | "Moderate" | "Poor" = "Poor";
  if (CV_pct < 10) cv_classification = "Excellent";
  else if (CV_pct <= 20) cv_classification = "Good";
  else if (CV_pct <= 30) cv_classification = "Moderate";

  // Steps formatting
  const steps = [
    {
      step: "1",
      name: "Grand Total (G) & Mean (x̄)",
      formula: "G = ΣTi, x̄ = G ÷ N",
      substitution: `G = ${G.toFixed(4)}, x̄ = ${G.toFixed(4)} ÷ ${N}`,
      result: grand_mean.toFixed(4)
    },
    {
      step: "2",
      name: "Correction Factor (CF)",
      formula: "G² ÷ (t × r)",
      substitution: `${G.toFixed(4)}² ÷ (${t} × ${r})`,
      result: CF.toFixed(4)
    },
    {
      step: "3",
      name: "Total Sum of Squares (TSS)",
      formula: "Σ(yij²) - CF",
      substitution: `${sum_yij_sq.toFixed(4)} - ${CF.toFixed(4)}`,
      result: TSS.toFixed(4)
    },
    {
      step: "4",
      name: "Treatment Sum of Squares (SS_T)",
      formula: "[Σ(Ti² ÷ r)] - CF",
      substitution: `${sum_Ti_sq_div_r.toFixed(4)} - ${CF.toFixed(4)}`,
      result: SS_treatment.toFixed(4)
    },
    {
      step: "5",
      name: "Error Sum of Squares (SS_E)",
      formula: "TSS - SS_T",
      substitution: `${TSS.toFixed(4)} - ${SS_treatment.toFixed(4)}`,
      result: SS_error.toFixed(4)
    },
    {
      step: "6",
      name: "Degrees of Freedom",
      formula: "df(T)=t-1, df(E)=t(r-1)",
      substitution: `df(T)=${t}-1, df(E)=${t}(${r}-1)`,
      result: `T:${df_treatment}, E:${df_error}`
    },
    {
      step: "7",
      name: "Mean Squares (MS)",
      formula: "SS ÷ df",
      substitution: `MS(T) = ${SS_treatment.toFixed(4)} ÷ ${df_treatment}`,
      result: `MS(T): ${MS_treatment.toFixed(4)}`
    },
    {
      step: "8",
      name: "F-Calculated",
      formula: "MS(T) ÷ MS(E)",
      substitution: `${MS_treatment.toFixed(4)} ÷ ${MS_error.toFixed(4)}`,
      result: f_calculated.toFixed(4)
    },
    {
      step: "9",
      name: "Standard Error of Mean (SEm)",
      formula: "√(MS(E) ÷ r)",
      substitution: `√(${MS_error.toFixed(4)} ÷ ${r})`,
      result: SEm.toFixed(4)
    },
    {
      step: "10",
      name: "Standard Error of Difference (SEd)",
      formula: "√(2 × MS(E) ÷ r)",
      substitution: `√(2 × ${MS_error.toFixed(4)} ÷ ${r})`,
      result: SEd.toFixed(4)
    },
    {
      step: "11",
      name: "Critical Difference (CD at 5%)",
      formula: "SEd × t(0.05, df_e)",
      substitution: `${SEd.toFixed(4)} × ${t_value.toFixed(3)}`,
      result: isSignificant ? CD_5pct.toFixed(4) : "NS"
    },
    {
      step: "12",
      name: "Coefficient of Variation (CV%)",
      formula: "(√MS(E) ÷ x̄) × 100",
      substitution: `(√${MS_error.toFixed(4)} ÷ ${grand_mean.toFixed(4)}) × 100`,
      result: CV_pct.toFixed(2) + "%"
    }
  ];

  // Treatment Comparisons
  const treatment_comparison = [];
  for (let i = 0; i < t; i++) {
    for (let j = i + 1; j < t; j++) {
      const diff = Math.abs(treatment_means[i] - treatment_means[j]);
      const sig = isSignificant ? diff > CD_5pct : false;
      treatment_comparison.push({
        treatment_i: treatments[i],
        treatment_j: treatments[j],
        mean_i: treatment_means[i],
        mean_j: treatment_means[j],
        difference: diff,
        significant: sig
      });
    }
  }

  return {
    summary: { t, r, N, G, grand_mean },
    ss: { CF, TSS, SS_treatment, SS_error },
    df: { treatment: df_treatment, error: df_error, total: df_total },
    ms: { treatment: MS_treatment, error: MS_error },
    f_calculated,
    t_value,
    results: {
      SEm,
      SEd,
      CD_5pct: final_CD,
      CV_pct
    },
    treatment_means,
    treatment_totals,
    significance,
    cv_classification,
    steps,
    treatment_comparison
  };
}
