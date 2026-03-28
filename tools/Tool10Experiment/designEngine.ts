import { DesignType, Treatment, Factor, Plot, LayoutResult } from './experimentTypes';
import { generateCRD, generateRCBD, generateFactorialRCBD, generateSplitPlot } from './layoutGenerator';

export function generateLayout(
  designType: DesignType,
  treatments: Treatment[],
  factors: Factor[],
  mainPlotTreatments: Treatment[],
  subPlotTreatments: Treatment[],
  replications: number,
  seed: number,
  plotLength: number,
  plotWidth: number
): LayoutResult {
  
  let plots: Plot[] = [];
  let totalPlots = 0;
  let rows = 0;
  let cols = 0;
  
  switch (designType) {
    case 'CRD':
      plots = generateCRD(treatments, replications, seed);
      totalPlots = treatments.length * replications;
      rows = replications;
      cols = treatments.length;
      break;
    case 'RCBD':
      plots = generateRCBD(treatments, replications, seed);
      totalPlots = treatments.length * replications;
      rows = replications;
      cols = treatments.length;
      break;
    case 'Factorial RCBD':
      plots = generateFactorialRCBD(factors, replications, seed);
      let totalCombinations = factors.reduce((acc, f) => acc * f.levels.length, 1);
      totalPlots = totalCombinations * replications;
      rows = replications;
      cols = totalCombinations;
      break;
    case 'Split Plot':
      plots = generateSplitPlot(mainPlotTreatments, subPlotTreatments, replications, seed);
      totalPlots = mainPlotTreatments.length * subPlotTreatments.length * replications;
      rows = replications;
      cols = mainPlotTreatments.length * subPlotTreatments.length;
      break;
  }
  
  const plotArea = plotLength * plotWidth;
  const totalArea = plotArea * totalPlots;
  
  return {
    plots,
    totalArea,
    rows,
    cols
  };
}
