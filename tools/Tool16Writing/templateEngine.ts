import { ExperimentData } from './writingTypes';

export function buildMethodology(data?: ExperimentData): string {
  if (!data) return "Methodology data is not available.";
  
  return `The experiment was conducted using a ${data.design} design with ${data.replications} replications. Each plot measured ${data.plotSize} m². Treatments consisted of ${data.treatmentCount} combinations. Standard agronomic practices were followed throughout the crop growth period.`;
}

export function buildObjectives(): string {
  return `The primary objective of this study was to evaluate the effects of the applied treatments on crop performance and yield. Secondary objectives included assessing the statistical significance of treatment variations and determining the optimal treatment combination for maximum productivity.`;
}
