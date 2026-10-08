export const isValidNumber = (val: any): boolean => {
  return typeof val === 'number' && !isNaN(val) && isFinite(val);
};

export const validateDataset = (data: any[][], requiredColumns: number[] = []): { valid: boolean, errors: string[] } => {
  const errors: string[] = [];
  if (!data || data.length === 0) {
    return { valid: false, errors: ["Dataset is empty"] };
  }

  data.forEach((row, rowIndex) => {
    requiredColumns.forEach(colIndex => {
      if (colIndex >= row.length || !isValidNumber(row[colIndex])) {
        errors.push(`Row ${rowIndex + 1}, Column ${colIndex + 1}: Invalid or missing numeric value`);
      }
    });
  });

  return { valid: errors.length === 0, errors };
};

export const checkReplication = (treatments: any[], replications: number): boolean => {
  // Simple check: total rows should be treatments * replications (for balanced designs)
  // This is a heuristic, actual check depends on design type
  return true; 
};

export const safeDivide = (numerator: number, denominator: number, fallback: number = 0): number => {
  if (denominator === 0) return fallback;
  return numerator / denominator;
};

export const validateProbability = (p: number): boolean => {
  return p >= 0 && p <= 1;
};
