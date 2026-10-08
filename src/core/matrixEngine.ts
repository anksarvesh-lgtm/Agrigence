import { mean } from './mathEngine';

export type Matrix = number[][];

export const createMatrix = (rows: number, cols: number, initialValue: number = 0): Matrix => {
  return Array(rows).fill(0).map(() => Array(cols).fill(initialValue));
};

export const transpose = (matrix: Matrix): Matrix => {
  if (matrix.length === 0) return [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = createMatrix(cols, rows);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
};

export const multiply = (A: Matrix, B: Matrix): Matrix => {
  if (A.length === 0 || B.length === 0) return [];
  const rA = A.length;
  const cA = A[0].length;
  const rB = B.length;
  const cB = B[0].length;

  if (cA !== rB) throw new Error(`Matrix dimension mismatch: ${rA}x${cA} vs ${rB}x${cB}`);

  const result = createMatrix(rA, cB);
  for (let i = 0; i < rA; i++) {
    for (let j = 0; j < cB; j++) {
      let sum = 0;
      for (let k = 0; k < cA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
};

export const covarianceMatrix = (data: Matrix): Matrix => {
  // data is assumed to be observations (rows) x variables (cols)
  if (data.length === 0) return [];
  const n = data.length;
  const p = data[0].length;
  
  // Calculate means for each variable
  const means = Array(p).fill(0);
  for (let j = 0; j < p; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += data[i][j];
    means[j] = sum / n;
  }

  // Center the data
  const centered = createMatrix(n, p);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      centered[i][j] = data[i][j] - means[j];
    }
  }

  // Covariance = (Centered^T * Centered) / (n - 1)
  const centeredT = transpose(centered);
  const prod = multiply(centeredT, centered);
  
  const cov = createMatrix(p, p);
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      cov[i][j] = prod[i][j] / (n - 1);
    }
  }
  return cov;
};

// Jacobi Eigenvalue Algorithm for Real Symmetric Matrices
export const eigen = (A: Matrix, maxIter: number = 100, tol: number = 1e-10): { values: number[], vectors: Matrix } => {
  const n = A.length;
  let V = createMatrix(n, n); // Eigenvectors
  for (let i = 0; i < n; i++) V[i][i] = 1.0;
  
  let D = A.map(row => [...row]); // Copy of A, will become diagonal matrix of eigenvalues

  for (let iter = 0; iter < maxIter; iter++) {
    let maxOffDiag = 0.0;
    let p = 0, q = 0;

    // Find max off-diagonal element
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(D[i][j]) > maxOffDiag) {
          maxOffDiag = Math.abs(D[i][j]);
          p = i;
          q = j;
        }
      }
    }

    if (maxOffDiag < tol) break;

    const phi = 0.5 * Math.atan2(2 * D[p][q], D[q][q] - D[p][p]);
    const c = Math.cos(phi);
    const s = Math.sin(phi);

    // Rotate D
    // We only need to update rows/cols p and q
    // But for simplicity in this implementation, we'll do full matrix updates or careful element updates
    // Standard Jacobi rotation:
    const Dpp = D[p][p];
    const Dqq = D[q][q];
    const Dpq = D[p][q];

    D[p][p] = c * c * Dpp - 2 * s * c * Dpq + s * s * Dqq;
    D[q][q] = s * s * Dpp + 2 * s * c * Dpq + c * c * Dqq;
    D[p][q] = 0;
    D[q][p] = 0;

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const Dip = D[i][p];
        const Diq = D[i][q];
        D[i][p] = c * Dip - s * Diq;
        D[p][i] = D[i][p];
        D[i][q] = s * Dip + c * Diq;
        D[q][i] = D[i][q];
      }
    }

    // Accumulate eigenvectors
    for (let i = 0; i < n; i++) {
      const Vip = V[i][p];
      const Viq = V[i][q];
      V[i][p] = c * Vip - s * Viq;
      V[i][q] = s * Vip + c * Viq;
    }
  }

  const values: number[] = [];
  for (let i = 0; i < n; i++) values.push(D[i][i]);

  // Sort eigenvalues and vectors descending
  const indices = Array.from(Array(n).keys()).sort((a, b) => values[b] - values[a]);
  const sortedValues = indices.map(i => values[i]);
  const sortedVectors = createMatrix(n, n);
  
  for (let i = 0; i < n; i++) { // row
    for (let j = 0; j < n; j++) { // col
       sortedVectors[i][j] = V[i][indices[j]];
    }
  }

  return { values: sortedValues, vectors: sortedVectors };
};

export const euclideanDistance = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return NaN;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
};
