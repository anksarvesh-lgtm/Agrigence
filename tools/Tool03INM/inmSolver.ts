
import { LPModel } from './inmTypes';

/**
 * Simplex Solver (Primal Simplex with Big M Method)
 * Handles Minimization problems.
 */
export function solveLP(model: LPModel) {
  const { A, b, c, constraintTypes } = model;
  const numConstraints = b.length;
  const numVars = c.length;

  // Big M constant
  const M = 1000000;

  // We need to convert constraints to equalities
  // LE: + slack
  // GE: - surplus + artificial
  // EQ: + artificial

  let slackCount = 0;
  let surplusCount = 0;
  let artificialCount = 0;

  constraintTypes.forEach(type => {
    if (type === 'LE') slackCount++;
    else if (type === 'GE') { surplusCount++; artificialCount++; }
    else if (type === 'EQ') artificialCount++;
  });

  const totalCols = numVars + slackCount + surplusCount + artificialCount;
  const tableau: number[][] = Array.from({ length: numConstraints + 1 }, () => new Array(totalCols + 1).fill(0));

  // Fill constraints
  let currentSlackIdx = numVars;
  let currentSurplusIdx = numVars + slackCount;
  let currentArtificialIdx = numVars + slackCount + surplusCount;

  for (let i = 0; i < numConstraints; i++) {
    for (let j = 0; j < numVars; j++) {
      tableau[i][j] = A[i][j];
    }
    tableau[i][totalCols] = b[i];

    if (constraintTypes[i] === 'LE') {
      tableau[i][currentSlackIdx++] = 1;
    } else if (constraintTypes[i] === 'GE') {
      tableau[i][currentSurplusIdx++] = -1;
      tableau[i][currentArtificialIdx++] = 1;
    } else if (constraintTypes[i] === 'EQ') {
      tableau[i][currentArtificialIdx++] = 1;
    }
  }

  // Objective Function (Minimization: Z = sum(c_i * x_i))
  // We want to minimize Z, which is equivalent to maximizing -Z.
  // In the tableau, we represent the objective as Z - sum(c_i * x_i) = 0
  // For artificial variables, we add M * sum(A_i) to the objective (Big M method for minimization)
  
  for (let j = 0; j < numVars; j++) {
    tableau[numConstraints][j] = -c[j];
  }

  // Add Big M penalty for artificial variables to the objective row
  // Objective row: Z - sum(c_i * x_i) - M * sum(Artificial_i) = 0
  // But we need to eliminate artificial variables from the objective row using the constraint rows
  for (let i = 0; i < numConstraints; i++) {
    if (constraintTypes[i] === 'GE' || constraintTypes[i] === 'EQ') {
      const artIdx = numVars + slackCount + surplusCount + (i - (constraintTypes.filter((t, idx) => idx < i && t === 'LE').length));
      // This is a bit complex to track accurately without a map. Let's simplify artificial index tracking.
    }
  }

  // Re-tracking artificial variables for Big M
  let artIdxCounter = numVars + slackCount + surplusCount;
  for (let i = 0; i < numConstraints; i++) {
    if (constraintTypes[i] === 'GE' || constraintTypes[i] === 'EQ') {
      const artIdx = artIdxCounter++;
      // Penalty in objective: Z = sum(c*x) + M*sum(art)
      // Row: Z - sum(c*x) - M*sum(art) = 0
      // To get artificial variables out of the objective row, we subtract M * row_i from objective row
      for (let j = 0; j <= totalCols; j++) {
        tableau[numConstraints][j] -= M * tableau[i][j];
      }
    }
  }

  // Simplex Iterations
  let iterations = 0;
  const maxIterations = 200;

  while (iterations < maxIterations) {
    // Find entering variable (most negative in objective row for maximization of -Z)
    let pivotCol = -1;
    let minVal = 0;
    for (let j = 0; j < totalCols; j++) {
      if (tableau[numConstraints][j] < minVal) {
        minVal = tableau[numConstraints][j];
        pivotCol = j;
      }
    }

    if (pivotCol === -1) break; // Optimal

    // Find leaving variable (minimum ratio test)
    let pivotRow = -1;
    let minRatio = Infinity;
    for (let i = 0; i < numConstraints; i++) {
      if (tableau[i][pivotCol] > 0) {
        const ratio = tableau[i][totalCols] / tableau[i][pivotCol];
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = i;
        }
      }
    }

    if (pivotRow === -1) return { status: 'UNBOUNDED', variables: [], objectiveValue: 0 };

    // Pivot
    const pivotVal = tableau[pivotRow][pivotCol];
    for (let j = 0; j <= totalCols; j++) {
      tableau[pivotRow][j] /= pivotVal;
    }

    for (let i = 0; i <= numConstraints; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotCol];
        for (let j = 0; j <= totalCols; j++) {
          tableau[i][j] -= factor * tableau[pivotRow][j];
        }
      }
    }

    iterations++;
  }

  // Extract variables
  const variables = new Array(numVars).fill(0);
  for (let j = 0; j < numVars; j++) {
    let countOnes = 0;
    let rowIdx = -1;
    for (let i = 0; i < numConstraints; i++) {
      if (Math.abs(tableau[i][j] - 1) < 1e-6) {
        countOnes++;
        rowIdx = i;
      } else if (Math.abs(tableau[i][j]) > 1e-6) {
        countOnes = 2; // Not a basic variable
        break;
      }
    }
    if (countOnes === 1) {
      variables[j] = tableau[rowIdx][totalCols];
    }
  }

  // Check if artificial variables are still in the basis (Infeasible)
  let artIdxCheck = numVars + slackCount + surplusCount;
  for (let i = 0; i < numConstraints; i++) {
    if (constraintTypes[i] === 'GE' || constraintTypes[i] === 'EQ') {
      const artIdx = artIdxCheck++;
      // If artificial variable is basic and non-zero
      let isBasic = true;
      let row = -1;
      for (let r = 0; r < numConstraints; r++) {
        if (Math.abs(tableau[r][artIdx] - 1) < 1e-6) row = r;
        else if (Math.abs(tableau[r][artIdx]) > 1e-6) isBasic = false;
      }
      if (isBasic && row !== -1 && tableau[row][totalCols] > 1e-4) {
        return { status: 'INFEASIBLE', variables: [], objectiveValue: 0 };
      }
    }
  }

  return {
    status: 'OPTIMAL',
    variables,
    objectiveValue: tableau[numConstraints][totalCols]
  };
}
