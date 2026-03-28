
import { INMSource, INMSettings, INMRequirement, LPModel } from './inmTypes';

export function buildConstraints(requirement: INMRequirement, sources: INMSource[], settings: INMSettings): LPModel {
  const numVars = sources.length;
  const A: number[][] = [];
  const b: number[] = [];
  const constraintTypes: ('LE' | 'GE' | 'EQ')[] = [];

  // 1. Nutrient N (GE)
  const rowN = sources.map(s => (s.material.N / 100) * s.material.efficiency);
  A.push(rowN);
  b.push(requirement.N);
  constraintTypes.push('GE');

  // 2. Nutrient P (GE)
  const rowP = sources.map(s => (s.material.P / 100) * s.material.efficiency);
  A.push(rowP);
  b.push(requirement.P);
  constraintTypes.push('GE');

  // 3. Nutrient K (GE)
  const rowK = sources.map(s => (s.material.K / 100) * s.material.efficiency);
  A.push(rowK);
  b.push(requirement.K);
  constraintTypes.push('GE');

  // 4. Organic Substitution (LE)
  // Organic_N <= (MaxOrganic% / 100) * Required N
  const rowOrgN = sources.map(s => s.material.category === 'Organic' ? (s.material.N / 100) * s.material.efficiency : 0);
  A.push(rowOrgN);
  b.push((settings.maxOrganicSubstitution / 100) * requirement.N);
  constraintTypes.push('LE');

  // 5. Budget (LE) - Optional
  if (settings.budgetLimit && settings.budgetLimit > 0) {
    const rowBudget = sources.map(s => s.price);
    A.push(rowBudget);
    b.push(settings.budgetLimit);
    constraintTypes.push('LE');
  }

  // 6. Availability (LE) - One per source
  sources.forEach((s, idx) => {
    if (s.maxQty > 0) {
      const rowAvail = new Array(numVars).fill(0);
      rowAvail[idx] = 1;
      A.push(rowAvail);
      b.push(s.maxQty);
      constraintTypes.push('LE');
    }
  });

  // Objective coefficients (c) - will be built by buildObjective
  return { A, b, c: [], constraintTypes };
}
