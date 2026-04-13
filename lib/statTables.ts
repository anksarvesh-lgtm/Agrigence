export const tukeyTable05 = [
  { df: 1, values: [0, 0, 17.97, 26.98, 32.82, 37.08, 40.41, 43.12, 45.40, 47.36, 49.07] },
  { df: 2, values: [0, 0, 6.08, 8.33, 9.80, 10.88, 11.74, 12.44, 13.03, 13.54, 13.99] },
  { df: 3, values: [0, 0, 4.50, 5.91, 6.82, 7.50, 8.04, 8.48, 8.85, 9.18, 9.46] },
  { df: 4, values: [0, 0, 3.93, 5.04, 5.76, 6.29, 6.71, 7.05, 7.35, 7.60, 7.83] },
  { df: 5, values: [0, 0, 3.64, 4.60, 5.22, 5.67, 6.03, 6.33, 6.58, 6.80, 6.99] },
  { df: 10, values: [0, 0, 3.15, 3.88, 4.33, 4.65, 4.91, 5.12, 5.30, 5.46, 5.60] },
  { df: 15, values: [0, 0, 3.01, 3.67, 4.08, 4.37, 4.59, 4.78, 4.94, 5.08, 5.20] },
  { df: 20, values: [0, 0, 2.95, 3.58, 3.96, 4.23, 4.45, 4.62, 4.77, 4.90, 5.01] },
  { df: 30, values: [0, 0, 2.89, 3.49, 3.85, 4.10, 4.30, 4.46, 4.60, 4.72, 4.82] },
  { df: 60, values: [0, 0, 2.83, 3.40, 3.74, 3.98, 4.16, 4.31, 4.44, 4.55, 4.65] },
  { df: 120, values: [0, 0, 2.80, 3.36, 3.68, 3.92, 4.10, 4.24, 4.36, 4.47, 4.56] },
  { df: 1000, values: [0, 0, 2.77, 3.31, 3.63, 3.86, 4.03, 4.17, 4.29, 4.39, 4.47] }
];

export const duncanTable05 = [
  { df: 1, values: [0, 0, 17.97, 17.97, 17.97, 17.97, 17.97, 17.97, 17.97, 17.97, 17.97] },
  { df: 2, values: [0, 0, 6.08, 6.08, 6.08, 6.08, 6.08, 6.08, 6.08, 6.08, 6.08] },
  { df: 3, values: [0, 0, 4.50, 4.50, 4.50, 4.50, 4.50, 4.50, 4.50, 4.50, 4.50] },
  { df: 4, values: [0, 0, 3.93, 4.01, 4.02, 4.02, 4.02, 4.02, 4.02, 4.02, 4.02] },
  { df: 5, values: [0, 0, 3.64, 3.74, 3.79, 3.83, 3.85, 3.87, 3.88, 3.89, 3.90] },
  { df: 10, values: [0, 0, 3.15, 3.30, 3.37, 3.43, 3.46, 3.49, 3.51, 3.52, 3.53] },
  { df: 15, values: [0, 0, 3.01, 3.16, 3.25, 3.31, 3.36, 3.39, 3.41, 3.43, 3.45] },
  { df: 20, values: [0, 0, 2.95, 3.10, 3.18, 3.25, 3.30, 3.33, 3.36, 3.38, 3.39] },
  { df: 30, values: [0, 0, 2.89, 3.04, 3.12, 3.20, 3.25, 3.29, 3.32, 3.34, 3.36] },
  { df: 60, values: [0, 0, 2.83, 2.98, 3.08, 3.14, 3.20, 3.24, 3.28, 3.31, 3.33] },
  { df: 120, values: [0, 0, 2.80, 2.95, 3.05, 3.12, 3.17, 3.22, 3.25, 3.28, 3.30] },
  { df: 1000, values: [0, 0, 2.77, 2.92, 3.02, 3.09, 3.15, 3.19, 3.23, 3.26, 3.28] }
];

export function getTukeyQ(k: number, df: number): number {
  return interpolate(tukeyTable05, df, k);
}

export function getDuncanR(p: number, df: number): number {
  return interpolate(duncanTable05, df, p);
}

function interpolate(table: any[], df: number, k: number): number {
  const maxK = table[0].values.length - 1;
  const safeK = Math.min(Math.max(2, k), maxK);

  if (df <= table[0].df) return table[0].values[safeK];
  if (df >= table[table.length - 1].df) return table[table.length - 1].values[safeK];

  for (let i = 0; i < table.length - 1; i++) {
    if (df >= table[i].df && df <= table[i+1].df) {
      const df1 = table[i].df;
      const df2 = table[i+1].df;
      const v1 = table[i].values[safeK];
      const v2 = table[i+1].values[safeK];
      return v1 + (v2 - v1) * ((df - df1) / (df2 - df1));
    }
  }
  return table[table.length - 1].values[safeK];
}
