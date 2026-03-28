export interface ExperimentData {
  design: string;
  replications: number;
  plotSize: number;
  treatmentCount: number;
}

export interface AnovaData {
  fValue: number;
  cv: number;
  isSignificant: boolean;
  bestTreatment?: string;
  bestYield?: number;
}

export interface ClimateData {
  totalGDD: number;
  heatStressDays: number;
}

export interface ReportData {
  experiment?: ExperimentData;
  anova?: AnovaData;
  climate?: ClimateData;
}

export interface GeneratedSection {
  title: string;
  content: string;
}
