// @ts-ignore
import { jStat } from 'jstat';
import { getTukeyQ, getDuncanR } from './statTables';

export type ANOVAInput = {
  design: 'CRD' | 'RBD' | 'LSD' | 'Factorial RBD';
  data: any[];
  responseCol: string;
  treatmentCol?: string;
  blockCol?: string;
  rowCol?: string;
  colCol?: string;
  factorACol?: string;
  factorBCol?: string;
  postHoc: 'None' | 'LSD' | 'Tukey' | 'DMRT';
};

export type TreatmentMean = {
  id: string;
  mean: number;
  n: number;
  grouping: string;
};

export type ANOVAOutput = {
  SST: number;
  SSTR?: number;
  SSB?: number;
  SSR?: number;
  SSC?: number;
  SSA?: number;
  SSFactorB?: number;
  SSAB?: number;
  SSE: number;
  
  MST?: number;
  MSB?: number;
  MSR?: number;
  MSC?: number;
  MSA?: number;
  MSFactorB?: number;
  MSAB?: number;
  MSE: number;
  
  F?: number;
  FA?: number;
  FFactorB?: number;
  FAB?: number;
  
  dfT?: number;
  dfB?: number;
  dfR?: number;
  dfC?: number;
  dfA?: number;
  dfFactorB?: number;
  dfAB?: number;
  dfE: number;
  
  Ftab05?: number;
  Ftab01?: number;
  FtabA05?: number;
  FtabA01?: number;
  FtabB05?: number;
  FtabB01?: number;
  FtabAB05?: number;
  FtabAB01?: number;

  treatmentMeans: TreatmentMean[];
  factorAMeans?: TreatmentMean[];
  factorBMeans?: TreatmentMean[];
  interactionMeans?: TreatmentMean[];
  
  postHocMethod: string;
  criticalValues: number[];
  sem: number;
  sed: number;
  semA?: number;
  sedA?: number;
  semB?: number;
  sedB?: number;
  semAB?: number;
  sedAB?: number;
};

export function computeANOVA(input: ANOVAInput): ANOVAOutput {
  const { design, data, responseCol, postHoc } = input;
  
  // Extract response variable
  const y = data.map(d => parseFloat(d[responseCol])).filter(v => !isNaN(v));
  const N = y.length;
  const T = y.reduce((a, b) => a + b, 0);
  const CF = (T * T) / N;
  const SST = y.reduce((a, val) => a + val * val, 0) - CF;

  let result: Partial<ANOVAOutput> = { SST, postHocMethod: postHoc };

  // Helper to group data
  const groupBy = (key: string) => {
    const groups: Record<string, number[]> = {};
    data.forEach(d => {
      const k = String(d[key]);
      const val = parseFloat(d[responseCol]);
      if (!isNaN(val)) {
        if (!groups[k]) groups[k] = [];
        groups[k].push(val);
      }
    });
    return groups;
  };

  const calcSS = (groups: Record<string, number[]>) => {
    let ss = 0;
    for (const k in groups) {
      const sum = groups[k].reduce((a, b) => a + b, 0);
      ss += (sum * sum) / groups[k].length;
    }
    return ss - CF;
  };

  const getMeans = (groups: Record<string, number[]>): TreatmentMean[] => {
    const means = Object.keys(groups).map(k => {
      const sum = groups[k].reduce((a, b) => a + b, 0);
      return { id: k, mean: sum / groups[k].length, n: groups[k].length, grouping: '' };
    });
    return means.sort((a, b) => b.mean - a.mean);
  };

  if (design === 'CRD' && input.treatmentCol) {
    const trtGroups = groupBy(input.treatmentCol);
    const t = Object.keys(trtGroups).length;
    
    result.SSTR = calcSS(trtGroups);
    result.SSE = SST - result.SSTR;
    result.dfT = t - 1;
    result.dfE = N - t;
    result.MST = result.SSTR / result.dfT;
    result.MSE = result.SSE / result.dfE;
    result.F = result.MST / result.MSE;
    result.Ftab05 = jStat.centralF.inv(0.95, result.dfT, result.dfE);
    result.Ftab01 = jStat.centralF.inv(0.99, result.dfT, result.dfE);
    result.treatmentMeans = getMeans(trtGroups);
    
    const r = N / t; // assuming equal reps for SE
    result.sem = Math.sqrt(result.MSE / r);
    result.sed = Math.sqrt((2 * result.MSE) / r);

  } else if (design === 'RBD' && input.treatmentCol && input.blockCol) {
    const trtGroups = groupBy(input.treatmentCol);
    const blkGroups = groupBy(input.blockCol);
    const t = Object.keys(trtGroups).length;
    const r = Object.keys(blkGroups).length;

    result.SSTR = calcSS(trtGroups);
    result.SSB = calcSS(blkGroups);
    result.SSE = SST - result.SSTR - result.SSB;
    
    result.dfT = t - 1;
    result.dfB = r - 1;
    result.dfE = (t - 1) * (r - 1);
    
    result.MST = result.SSTR / result.dfT;
    result.MSB = result.SSB / result.dfB;
    result.MSE = result.SSE / result.dfE;
    result.F = result.MST / result.MSE;
    
    result.Ftab05 = jStat.centralF.inv(0.95, result.dfT, result.dfE);
    result.Ftab01 = jStat.centralF.inv(0.99, result.dfT, result.dfE);
    result.treatmentMeans = getMeans(trtGroups);
    
    result.sem = Math.sqrt(result.MSE / r);
    result.sed = Math.sqrt((2 * result.MSE) / r);

  } else if (design === 'LSD' && input.treatmentCol && input.rowCol && input.colCol) {
    const trtGroups = groupBy(input.treatmentCol);
    const rowGroups = groupBy(input.rowCol);
    const colGroups = groupBy(input.colCol);
    const t = Object.keys(trtGroups).length;

    result.SSTR = calcSS(trtGroups);
    result.SSR = calcSS(rowGroups);
    result.SSC = calcSS(colGroups);
    result.SSE = SST - result.SSTR - result.SSR - result.SSC;
    
    result.dfT = t - 1;
    result.dfR = t - 1;
    result.dfC = t - 1;
    result.dfE = (t - 1) * (t - 2);
    
    result.MST = result.SSTR / result.dfT;
    result.MSR = result.SSR / result.dfR;
    result.MSC = result.SSC / result.dfC;
    result.MSE = result.SSE / result.dfE;
    result.F = result.MST / result.MSE;
    
    result.Ftab05 = jStat.centralF.inv(0.95, result.dfT, result.dfE);
    result.Ftab01 = jStat.centralF.inv(0.99, result.dfT, result.dfE);
    result.treatmentMeans = getMeans(trtGroups);
    
    result.sem = Math.sqrt(result.MSE / t);
    result.sed = Math.sqrt((2 * result.MSE) / t);

  } else if (design === 'Factorial RBD' && input.factorACol && input.factorBCol && input.blockCol) {
    const aGroups = groupBy(input.factorACol);
    const bGroups = groupBy(input.factorBCol);
    const blkGroups = groupBy(input.blockCol);
    
    const aLevels = Object.keys(aGroups).length;
    const bLevels = Object.keys(bGroups).length;
    const r = Object.keys(blkGroups).length;

    // Interaction groups (A x B)
    const abGroups: Record<string, number[]> = {};
    data.forEach(d => {
      const k = `${d[input.factorACol!]}_${d[input.factorBCol!]}`;
      const val = parseFloat(d[responseCol]);
      if (!isNaN(val)) {
        if (!abGroups[k]) abGroups[k] = [];
        abGroups[k].push(val);
      }
    });

    result.SSA = calcSS(aGroups);
    result.SSFactorB = calcSS(bGroups);
    result.SSB = calcSS(blkGroups);
    
    const SS_Subclass = calcSS(abGroups);
    result.SSAB = SS_Subclass - result.SSA - result.SSFactorB;
    
    result.SSE = SST - result.SSA - result.SSFactorB - result.SSAB - result.SSB;
    
    result.dfA = aLevels - 1;
    result.dfFactorB = bLevels - 1;
    result.dfAB = (aLevels - 1) * (bLevels - 1);
    result.dfB = r - 1;
    result.dfE = (aLevels * bLevels - 1) * (r - 1);
    
    result.MSA = result.SSA / result.dfA;
    result.MSFactorB = result.SSFactorB / result.dfFactorB;
    result.MSAB = result.SSAB / result.dfAB;
    result.MSB = result.SSB / result.dfB;
    result.MSE = result.SSE / result.dfE;
    
    result.FA = result.MSA / result.MSE;
    result.FFactorB = result.MSFactorB / result.MSE;
    result.FAB = result.MSAB / result.MSE;
    
    result.FtabA05 = jStat.centralF.inv(0.95, result.dfA, result.dfE);
    result.FtabA01 = jStat.centralF.inv(0.99, result.dfA, result.dfE);
    result.FtabB05 = jStat.centralF.inv(0.95, result.dfFactorB, result.dfE);
    result.FtabB01 = jStat.centralF.inv(0.99, result.dfFactorB, result.dfE);
    result.FtabAB05 = jStat.centralF.inv(0.95, result.dfAB, result.dfE);
    result.FtabAB01 = jStat.centralF.inv(0.99, result.dfAB, result.dfE);

    result.factorAMeans = getMeans(aGroups);
    result.factorBMeans = getMeans(bGroups);
    result.interactionMeans = getMeans(abGroups);
    
    // For post-hoc, we'll use interaction means as default treatment means
    result.treatmentMeans = result.interactionMeans;
    
    result.semA = Math.sqrt(result.MSE / (r * bLevels));
    result.sedA = Math.sqrt((2 * result.MSE) / (r * bLevels));
    result.semB = Math.sqrt(result.MSE / (r * aLevels));
    result.sedB = Math.sqrt((2 * result.MSE) / (r * aLevels));
    result.semAB = Math.sqrt(result.MSE / r);
    result.sedAB = Math.sqrt((2 * result.MSE) / r);
    
    result.sem = result.semAB;
    result.sed = result.sedAB;
  } else {
    throw new Error("Please ensure all required columns are mapped for the selected design.");
  }

  // Post-Hoc Critical Values
  let criticalValues: number[] = [];
  const dfE = result.dfE || 1;
  const sem = result.sem || 0;
  const sed = result.sed || 0;
  const tCount = result.treatmentMeans?.length || 2;

  if (postHoc === 'LSD') {
    const tVal = jStat.studentt.inv(0.975, dfE);
    criticalValues = [tVal * sed];
  } else if (postHoc === 'Tukey') {
    const q = getTukeyQ(tCount, dfE);
    criticalValues = [q * sem];
  } else if (postHoc === 'DMRT') {
    for (let p = 2; p <= tCount; p++) {
      const rp = getDuncanR(p, dfE);
      criticalValues.push(rp * sem);
    }
  }
  result.criticalValues = criticalValues;

  // Grouping Algorithm
  if (postHoc !== 'None' && criticalValues.length > 0 && result.treatmentMeans) {
    const getW = (i: number, j: number) => {
      if (postHoc === 'LSD' || postHoc === 'Tukey') return criticalValues[0];
      if (postHoc === 'DMRT') {
        const p = Math.abs(i - j) + 1;
        if (p < 2) return 0;
        return criticalValues[p - 2] || criticalValues[criticalValues.length - 1];
      }
      return Infinity;
    };

    const blocks: {start: number, end: number}[] = [];
    for (let i = 0; i < tCount; i++) {
      for (let j = tCount - 1; j >= i; j--) {
        if (result.treatmentMeans[i].mean - result.treatmentMeans[j].mean <= getW(i, j)) {
          const isContained = blocks.some(b => b.start <= i && b.end >= j);
          if (!isContained) blocks.push({start: i, end: j});
          break;
        }
      }
    }

    let letterCode = 97;
    blocks.forEach(block => {
      const letter = String.fromCharCode(letterCode++);
      for (let i = block.start; i <= block.end; i++) {
        result.treatmentMeans![i].grouping += letter;
      }
    });
  }

  return result as ANOVAOutput;
}
