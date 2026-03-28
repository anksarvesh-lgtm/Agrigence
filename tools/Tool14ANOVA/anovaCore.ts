import { Observation, AnovaSummary, DesignType } from './anovaTypes';
import { grandMean, totalSS, treatmentSS, blockSS } from './sumSquares';
import { LSD, CV, assignGroupings } from './meanCompare';
import { getTValue, getFCrit } from './statsUtils';

export function calculateANOVA(data: Observation[], design: DesignType): AnovaSummary {
  const values = data.map(d => d.value);
  const gm = grandMean(values);
  const tss = totalSS(values, gm);
  
  const trtGroups: Record<string, number[]> = {};
  const repGroups: Record<string, number[]> = {};
  
  data.forEach(d => {
    if (!trtGroups[d.treatment]) trtGroups[d.treatment] = [];
    trtGroups[d.treatment].push(d.value);
    
    if (!repGroups[d.replication]) repGroups[d.replication] = [];
    repGroups[d.replication].push(d.value);
  });
  
  const numTrt = Object.keys(trtGroups).length;
  const numRep = Object.keys(repGroups).length;
  const totalObs = values.length;
  
  const trtMeans: Record<string, number> = {};
  for (const t in trtGroups) {
    trtMeans[t] = trtGroups[t].reduce((a, b) => a + b, 0) / trtGroups[t].length;
  }
  
  const trss = treatmentSS(trtMeans, numRep, gm);
  
  let table: any[] = [];
  let mse = 0;
  let fCalc = 0;
  let dfError = 0;
  
  if (design === 'CRD') {
    const dfTrt = numTrt - 1;
    const dfTotal = totalObs - 1;
    dfError = dfTotal - dfTrt;
    
    const ess = tss - trss;
    
    const msTrt = dfTrt > 0 ? trss / dfTrt : 0;
    mse = dfError > 0 ? ess / dfError : 0;
    
    fCalc = mse > 0 ? msTrt / mse : 0;
    
    table = [
      { source: 'Treatment', df: dfTrt, ss: trss, ms: msTrt, f: fCalc },
      { source: 'Error', df: dfError, ss: ess, ms: mse, f: null },
      { source: 'Total', df: dfTotal, ss: tss, ms: null, f: null }
    ];
  } else if (design === 'RCBD') {
    const repMeans: Record<string, number> = {};
    for (const r in repGroups) {
      repMeans[r] = repGroups[r].reduce((a, b) => a + b, 0) / repGroups[r].length;
    }
    
    const bss = blockSS(repMeans, numTrt, gm);
    const ess = tss - trss - bss;
    
    const dfTrt = numTrt - 1;
    const dfRep = numRep - 1;
    const dfTotal = totalObs - 1;
    dfError = dfTrt * dfRep;
    
    const msTrt = dfTrt > 0 ? trss / dfTrt : 0;
    const msRep = dfRep > 0 ? bss / dfRep : 0;
    mse = dfError > 0 ? ess / dfError : 0;
    
    fCalc = mse > 0 ? msTrt / mse : 0;
    const fRep = mse > 0 ? msRep / mse : 0;
    
    table = [
      { source: 'Replication', df: dfRep, ss: bss, ms: msRep, f: fRep },
      { source: 'Treatment', df: dfTrt, ss: trss, ms: msTrt, f: fCalc },
      { source: 'Error', df: dfError, ss: ess, ms: mse, f: null },
      { source: 'Total', df: dfTotal, ss: tss, ms: null, f: null }
    ];
  }
  
  const cv = CV(mse, gm);
  const tVal = getTValue(dfError);
  const lsd = LSD(tVal, mse, numRep);
  
  const fCrit = getFCrit(numTrt - 1, dfError);
  const isSignificant = fCalc > fCrit;
  
  const meansList = Object.keys(trtMeans).map(t => ({ treatment: t, mean: trtMeans[t] }));
  const groupedMeans = assignGroupings(meansList, lsd);
  
  return {
    table,
    means: groupedMeans,
    cv,
    lsd,
    fCalc,
    isSignificant,
    grandMean: gm
  };
}
