
import { INMRequirement, INMSource, INMSettings, LPSolution } from './inmTypes';
import { buildConstraints } from './inmConstraints';
import { buildObjective } from './inmObjective';
import { solveLP } from './inmSolver';

export function runOptimization(
  requirement: INMRequirement,
  sources: INMSource[],
  settings: INMSettings
): LPSolution {
  // 1. Build Model
  const model = buildConstraints(requirement, sources, settings);
  model.c = buildObjective(sources, settings);

  // 2. Solve
  const rawSolution = solveLP(model);

  if (rawSolution.status !== 'OPTIMAL') {
    return {
      status: rawSolution.status as any,
      variables: [],
      objectiveValue: 0,
      supplied: { N: 0, P: 0, K: 0 },
      organicShare: 0,
      cost: 0
    };
  }

  // 3. Calculate derived metrics
  let totalN = 0;
  let totalP = 0;
  let totalK = 0;
  let organicN = 0;
  let totalCost = 0;

  rawSolution.variables.forEach((qty, idx) => {
    const s = sources[idx];
    const n = qty * (s.material.N / 100) * s.material.efficiency;
    const p = qty * (s.material.P / 100) * s.material.efficiency;
    const k = qty * (s.material.K / 100) * s.material.efficiency;
    
    totalN += n;
    totalP += p;
    totalK += k;
    totalCost += qty * s.price;

    if (s.material.category === 'Organic') {
      organicN += n;
    }
  });

  return {
    status: 'OPTIMAL',
    variables: rawSolution.variables,
    objectiveValue: rawSolution.objectiveValue,
    supplied: { N: totalN, P: totalP, K: totalK },
    organicShare: totalN > 0 ? (organicN / totalN) * 100 : 0,
    cost: totalCost
  };
}
