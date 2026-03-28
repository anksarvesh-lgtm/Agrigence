import { mean, variance, sum, stdDev } from './mathEngine';

export interface AnovaResult {
  source: string;
  df: number;
  ss: number;
  ms: number;
  f: number;
  p?: number;
}

export interface DescriptiveStats {
  n: number;
  mean: number;
  sd: number;
  cv: number;
  min: number;
  max: number;
  sum: number;
}

export interface MeanComparison {
  treatment: string;
  mean: number;
  grouping: string;
}

export interface AnovaSummary {
  table: AnovaResult[];
  means: MeanComparison[];
  cv: number;
  lsd: number;
  fCalc: number;
  isSignificant: boolean;
  grandMean: number;
}

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
    if (df < keys[i]) return tTable05[keys[i > 0 ? i - 1 : 0]];
  }
  return 1.96;
}

export function getFCrit(df1: number, df2: number): number {
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
    if (df2 <= k) { d2 = k; break; }
  }
  return fTable[d1]?.[d2] || 3.0;
}

export const getDescriptiveStats = (data: number[]): DescriptiveStats => {
  const n = data.length;
  if (n === 0) return { n: 0, mean: 0, sd: 0, cv: 0, min: 0, max: 0, sum: 0 };
  const m = mean(data);
  const sd = stdDev(data);
  return {
    n,
    mean: m,
    sd,
    cv: m !== 0 ? (sd / m) * 100 : 0,
    min: Math.min(...data),
    max: Math.max(...data),
    sum: sum(data)
  };
};

export function assignGroupings(means: {treatment: string, mean: number}[], lsd: number): MeanComparison[] {
  if (means.length === 0) return [];
  const sorted = [...means].sort((a, b) => b.mean - a.mean);
  let currentGroup = 'A';
  let currentMax = sorted[0].mean;
  return sorted.map((item, index) => {
    if (index === 0) return { ...item, grouping: currentGroup };
    if (currentMax - item.mean > lsd) {
      currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
      currentMax = item.mean;
    }
    return { ...item, grouping: currentGroup };
  });
}

// CRD ANOVA
export const calculateCRD = (trtGroups: Record<string, number[]>): AnovaSummary => {
  const allData = Object.values(trtGroups).flat();
  const n = allData.length;
  const k = Object.keys(trtGroups).length;
  const gm = mean(allData);
  const G = sum(allData);
  const CF = (G * G) / n;

  const tss = sum(allData.map(y => y * y)) - CF;
  const trss = sum(Object.values(trtGroups).map(g => (sum(g) * sum(g)) / g.length)) - CF;
  const dfTrt = k - 1;
  const msTrt = trss / dfTrt;

  const ess = tss - trss;
  const dfError = n - k;
  const msError = ess / dfError;

  const fCalc = msTrt / msError;
  const fCrit = getFCrit(dfTrt, dfError);

  const trtMeans = Object.keys(trtGroups).map(t => ({
    treatment: t,
    mean: mean(trtGroups[t])
  }));

  const cv = gm !== 0 ? (Math.sqrt(msError) / gm) * 100 : 0;
  const tVal = getTValue(dfError);
  const rAvg = n / k; // Average replication
  const lsd = tVal * Math.sqrt((2 * msError) / rAvg);

  return {
    table: [
      { source: 'Treatment', df: dfTrt, ss: trss, ms: msTrt, f: fCalc },
      { source: 'Error', df: dfError, ss: ess, ms: msError, f: NaN },
      { source: 'Total', df: n - 1, ss: tss, ms: NaN, f: NaN }
    ],
    means: assignGroupings(trtMeans, lsd),
    cv,
    lsd,
    fCalc,
    isSignificant: fCalc > fCrit,
    grandMean: gm
  };
};

// RBD ANOVA
export const calculateRBD = (data: Record<string, Record<string, number>>): AnovaSummary => {
  // data[treatment][replication]
  const trts = Object.keys(data);
  const reps = Object.keys(data[trts[0]]);
  const t = trts.length;
  const r = reps.length;
  const n = t * r;

  const allValues: number[] = [];
  trts.forEach(trt => {
    reps.forEach(rep => {
      allValues.push(data[trt][rep]);
    });
  });

  const gm = mean(allValues);
  const G = sum(allValues);
  const CF = (G * G) / n;

  const tss = sum(allValues.map(y => y * y)) - CF;

  // Treatment SS
  const trss = sum(trts.map(trt => {
    const trtSum = sum(Object.values(data[trt]));
    return (trtSum * trtSum) / r;
  })) - CF;
  const dfTrt = t - 1;
  const msTrt = trss / dfTrt;

  // Replication (Block) SS
  const bss = sum(reps.map(rep => {
    const repSum = sum(trts.map(trt => data[trt][rep]));
    return (repSum * repSum) / t;
  })) - CF;
  const dfRep = r - 1;
  const msRep = bss / dfRep;

  const ess = tss - trss - bss;
  const dfError = dfTrt * dfRep;
  const msError = ess / dfError;

  const fTrt = msTrt / msError;
  const fRep = msRep / msError;
  const fCrit = getFCrit(dfTrt, dfError);

  const trtMeans = trts.map(trt => ({
    treatment: trt,
    mean: mean(Object.values(data[trt]))
  }));

  const cv = gm !== 0 ? (Math.sqrt(msError) / gm) * 100 : 0;
  const tVal = getTValue(dfError);
  const lsd = tVal * Math.sqrt((2 * msError) / r);

  return {
    table: [
      { source: 'Replication', df: dfRep, ss: bss, ms: msRep, f: fRep },
      { source: 'Treatment', df: dfTrt, ss: trss, ms: msTrt, f: fTrt },
      { source: 'Error', df: dfError, ss: ess, ms: msError, f: NaN },
      { source: 'Total', df: n - 1, ss: tss, ms: NaN, f: NaN }
    ],
    means: assignGroupings(trtMeans, lsd),
    cv,
    lsd,
    fCalc: fTrt,
    isSignificant: fTrt > fCrit,
    grandMean: gm
  };
};

// LSD ANOVA (Latin Square Design)
export const calculateLSD = (data: {treatment: string, row: string, col: string, value: number}[]): AnovaSummary => {
  const n = data.length;
  const p = Math.sqrt(n); // Number of treatments/rows/cols
  if (p % 1 !== 0) throw new Error("LSD requires a square number of observations (p^2)");

  const allValues = data.map(d => d.value);
  const gm = mean(allValues);
  const G = sum(allValues);
  const CF = (G * G) / n;

  const tss = sum(allValues.map(y => y * y)) - CF;

  // Row SS
  const rowGroups: Record<string, number[]> = {};
  data.forEach(d => {
    if (!rowGroups[d.row]) rowGroups[d.row] = [];
    rowGroups[d.row].push(d.value);
  });
  const rss = sum(Object.values(rowGroups).map(g => (sum(g) * sum(g)) / p)) - CF;
  const dfRow = p - 1;
  const msRow = rss / dfRow;

  // Column SS
  const colGroups: Record<string, number[]> = {};
  data.forEach(d => {
    if (!colGroups[d.col]) colGroups[d.col] = [];
    colGroups[d.col].push(d.value);
  });
  const css = sum(Object.values(colGroups).map(g => (sum(g) * sum(g)) / p)) - CF;
  const dfCol = p - 1;
  const msCol = css / dfCol;

  // Treatment SS
  const trtGroups: Record<string, number[]> = {};
  data.forEach(d => {
    if (!trtGroups[d.treatment]) trtGroups[d.treatment] = [];
    trtGroups[d.treatment].push(d.value);
  });
  const trss = sum(Object.values(trtGroups).map(g => (sum(g) * sum(g)) / p)) - CF;
  const dfTrt = p - 1;
  const msTrt = trss / dfTrt;

  const ess = tss - rss - css - trss;
  const dfError = (p - 1) * (p - 2);
  const msError = ess / dfError;

  const fTrt = msTrt / msError;
  const fRow = msRow / msError;
  const fCol = msCol / msError;
  const fCrit = getFCrit(dfTrt, dfError);

  const trtMeans = Object.keys(trtGroups).map(t => ({
    treatment: t,
    mean: mean(trtGroups[t])
  }));

  const cv = gm !== 0 ? (Math.sqrt(msError) / gm) * 100 : 0;
  const tVal = getTValue(dfError);
  const lsd = tVal * Math.sqrt((2 * msError) / p);

  return {
    table: [
      { source: 'Rows', df: dfRow, ss: rss, ms: msRow, f: fRow },
      { source: 'Columns', df: dfCol, ss: css, ms: msCol, f: fCol },
      { source: 'Treatment', df: dfTrt, ss: trss, ms: msTrt, f: fTrt },
      { source: 'Error', df: dfError, ss: ess, ms: msError, f: NaN },
      { source: 'Total', df: n - 1, ss: tss, ms: NaN, f: NaN }
    ],
    means: assignGroupings(trtMeans, lsd),
    cv,
    lsd,
    fCalc: fTrt,
    isSignificant: fTrt > fCrit,
    grandMean: gm
  };
};

// 2-Factor Factorial ANOVA (in RBD)
export const calculateFactorial2 = (data: {a: string, b: string, rep: string, value: number}[]): AnovaSummary => {
  const n = data.length;
  const aLevels = Array.from(new Set(data.map(d => d.a)));
  const bLevels = Array.from(new Set(data.map(d => d.b)));
  const reps = Array.from(new Set(data.map(d => d.rep)));
  
  const p = aLevels.length;
  const q = bLevels.length;
  const r = reps.length;
  
  if (n === 0 || n !== p * q * r) throw new Error("Factorial ANOVA requires a balanced design (A x B x Rep)");

  const allValues = data.map(d => d.value);
  const gm = mean(allValues);
  const G = sum(allValues);
  const CF = (G * G) / n;

  const tss = sum(allValues.map(y => y * y)) - CF;

  // Replication SS
  const repSums: Record<string, number> = {};
  data.forEach(d => { repSums[d.rep] = (repSums[d.rep] || 0) + d.value; });
  const rss = sum(Object.values(repSums).map(s => (s * s) / (p * q))) - CF;
  const dfRep = r - 1;

  // Factor A SS
  const aSums: Record<string, number> = {};
  data.forEach(d => { aSums[d.a] = (aSums[d.a] || 0) + d.value; });
  const ssA = sum(Object.values(aSums).map(s => (s * s) / (q * r))) - CF;
  const dfA = p - 1;

  // Factor B SS
  const bSums: Record<string, number> = {};
  data.forEach(d => { bSums[d.b] = (bSums[d.b] || 0) + d.value; });
  const ssB = sum(Object.values(bSums).map(s => (s * s) / (p * r))) - CF;
  const dfB = q - 1;

  // Interaction AB SS
  const abSums: Record<string, number> = {};
  data.forEach(d => { 
    const key = `${d.a} x ${d.b}`;
    abSums[key] = (abSums[key] || 0) + d.value; 
  });
  const ssAB = sum(Object.values(abSums).map(s => (s * s) / r)) - CF - ssA - ssB;
  const dfAB = dfA * dfB;

  const ess = tss - rss - ssA - ssB - ssAB;
  const dfError = (p * q - 1) * (r - 1);
  const msError = ess / dfError;

  const msA = ssA / dfA;
  const msB = ssB / dfB;
  const msAB = ssAB / dfAB;
  const msRep = rss / dfRep;

  const fA = msA / msError;
  const fB = msB / msError;
  const fAB = msAB / msError;
  const fRep = msRep / msError;

  const fCritA = getFCrit(dfA, dfError);
  
  const trtMeans = Object.keys(abSums).map(key => ({
    treatment: key,
    mean: abSums[key] / r
  }));

  const cv = gm !== 0 ? (Math.sqrt(msError) / gm) * 100 : 0;
  const tVal = getTValue(dfError);
  const lsd = tVal * Math.sqrt((2 * msError) / r);

  return {
    table: [
      { source: 'Replication', df: dfRep, ss: rss, ms: msRep, f: fRep },
      { source: 'Factor A', df: dfA, ss: ssA, ms: msA, f: fA },
      { source: 'Factor B', df: dfB, ss: ssB, ms: msB, f: fB },
      { source: 'Interaction (AB)', df: dfAB, ss: ssAB, ms: msAB, f: fAB },
      { source: 'Error', df: dfError, ss: ess, ms: msError, f: NaN },
      { source: 'Total', df: n - 1, ss: tss, ms: NaN, f: NaN }
    ],
    means: assignGroupings(trtMeans, lsd),
    cv,
    lsd,
    fCalc: fA,
    isSignificant: fA > fCritA || fB > getFCrit(dfB, dfError) || fAB > getFCrit(dfAB, dfError),
    grandMean: gm
  };
};

export const tTest = (group1: number[], group2: number[], paired: boolean = false): { t: number, df: number } => {
  if (paired) {
    if (group1.length !== group2.length) throw new Error("Paired t-test requires equal sample sizes");
    const diffs = group1.map((val, i) => val - group2[i]);
    const dBar = mean(diffs);
    const sD = Math.sqrt(variance(diffs));
    const n = diffs.length;
    const t = dBar / (sD / Math.sqrt(n));
    return { t, df: n - 1 };
  } else {
    // Independent (assuming equal variances for simplicity here, Welch's is better)
    const m1 = mean(group1);
    const m2 = mean(group2);
    const v1 = variance(group1);
    const v2 = variance(group2);
    const n1 = group1.length;
    const n2 = group2.length;
    
    const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
    const se = Math.sqrt(pooledVar * (1/n1 + 1/n2));
    const t = (m1 - m2) / se;
    return { t, df: n1 + n2 - 2 };
  }
};

export const correlation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return NaN;
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
};

export const regression = (x: number[], y: number[]): { slope: number, intercept: number, r2: number } => {
  if (x.length !== y.length || x.length < 2) return { slope: 0, intercept: 0, r2: 0 };
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let den = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    num += dx * (y[i] - my);
    den += dx * dx;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  const r = correlation(x, y);
  return { slope, intercept, r2: r * r };
};

export const chiSquare = (observed: number[], expected: number[]): { chi2: number, df: number } => {
  if (observed.length !== expected.length) throw new Error("Observed and expected arrays must be same length");
  let chi2 = 0;
  for (let i = 0; i < observed.length; i++) {
    if (expected[i] === 0) continue;
    chi2 += Math.pow(observed[i] - expected[i], 2) / expected[i];
  }
  return { chi2, df: observed.length - 1 };
};
