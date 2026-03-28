import { Factor } from './factorialTypes';

export function validateFactorial(factors: Factor[]): string[] {
  const warnings: string[] = [];
  
  if (factors.length < 2) {
    warnings.push("Error: Minimum 2 factors are required for a factorial design.");
  }
  
  if (factors.length > 5) {
    warnings.push("Warning: More than 5 factors can make the experiment extremely complex to manage.");
  }

  let totalTreatments = 1;
  factors.forEach(f => {
    if (f.levels.length < 2) {
      warnings.push(`Error: Factor "${f.name || 'Unnamed'}" must have at least 2 levels.`);
    }
    totalTreatments *= Math.max(1, f.levels.length);
  });

  if (totalTreatments > 500) {
    warnings.push("Error: Experiment too large (>500 treatments). Reduce factors or levels.");
  } else if (totalTreatments > 200) {
    warnings.push("Warning: Experiment is very large (>200 treatments). Ensure adequate resources.");
  }

  return warnings;
}
