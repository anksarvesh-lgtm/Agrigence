export function fieldToPlotDose(fieldRateKgHa: number, plotAreaM2: number): number {
  return (fieldRateKgHa * plotAreaM2) / 10000;
}

export function fieldToPlotDoseGrams(fieldRateKgHa: number, plotAreaM2: number): number {
  return ((fieldRateKgHa * 1000) * plotAreaM2) / 10000;
}

export function mlPerPlot(rateMlHa: number, plotAreaM2: number): number {
  return (rateMlHa * plotAreaM2) / 10000;
}

export function productRequired(aiRequired: number, aiPercent: number): number {
  if (aiPercent <= 0) return 0;
  return aiRequired / (aiPercent / 100);
}
