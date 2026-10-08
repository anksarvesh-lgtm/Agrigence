export type DesignType = 'CRD' | 'RCBD';

export interface Observation {
  id: string;
  treatment: string;
  replication: string;
  value: number;
}

export interface AnovaResult {
  source: string;
  df: number;
  ss: number;
  ms: number | null;
  f: number | null;
}

export interface MeanComparison {
  treatment: string;
  mean: number;
  grouping: string;
}

export interface AnovaSummary {
  table: AnovaResult[];
  means: MeanComparison[];
  cv: number;
  lsd: number;
  fCalc: number;
  isSignificant: boolean;
  grandMean: number;
}
