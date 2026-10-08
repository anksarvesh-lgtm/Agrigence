import { shuffle } from './randomization';
import { Plot, Treatment, Factor } from './experimentTypes';

export function generateCRD(treatments: Treatment[], replications: number, seed: number): Plot[] {
  let layout: Plot[] = [];
  let allTreatments: string[] = [];
  
  for (let r = 1; r <= replications; r++) {
    treatments.forEach(t => allTreatments.push(t.code));
  }
  
  const randomized = shuffle([...allTreatments], seed);
  
  randomized.forEach((t, i) => {
    layout.push({
      plotNumber: i + 1,
      block: 1,
      treatment: t
    });
  });
  
  return layout;
}

export function generateRCBD(treatments: Treatment[], replications: number, seed: number): Plot[] {
  let layout: Plot[] = [];
  
  for (let r = 1; r <= replications; r++) {
    const randomized = shuffle([...treatments.map(t => t.code)], seed + r);
    randomized.forEach((t, i) => {
      layout.push({
        block: r,
        plotNumber: (r * 100) + i + 1,
        treatment: t
      });
    });
  }
  
  return layout;
}

export function generateFactorialRCBD(factors: Factor[], replications: number, seed: number): Plot[] {
  let combinations: string[] = [''];
  factors.forEach(f => {
    let newCombinations: string[] = [];
    combinations.forEach(c => {
      f.levels.forEach(l => {
        newCombinations.push(c ? `${c} + ${l}` : l);
      });
    });
    combinations = newCombinations;
  });
  
  let layout: Plot[] = [];
  for (let r = 1; r <= replications; r++) {
    const randomized = shuffle([...combinations], seed + r);
    randomized.forEach((t, i) => {
      layout.push({
        block: r,
        plotNumber: (r * 100) + i + 1,
        treatment: t
      });
    });
  }
  
  return layout;
}

export function generateSplitPlot(mainPlotTreatments: Treatment[], subPlotTreatments: Treatment[], replications: number, seed: number): Plot[] {
  let layout: Plot[] = [];
  
  for (let r = 1; r <= replications; r++) {
    const randomizedMain = shuffle([...mainPlotTreatments.map(t => t.code)], seed + r);
    
    randomizedMain.forEach((mainT, mIndex) => {
      const randomizedSub = shuffle([...subPlotTreatments.map(t => t.code)], seed + r + mIndex * 10);
      
      randomizedSub.forEach((subT, sIndex) => {
        layout.push({
          block: r,
          plotNumber: (r * 1000) + ((mIndex + 1) * 10) + sIndex + 1,
          treatment: `${mainT} + ${subT}`,
          mainPlot: mainT,
          subPlot: subT
        });
      });
    });
  }
  
  return layout;
}
