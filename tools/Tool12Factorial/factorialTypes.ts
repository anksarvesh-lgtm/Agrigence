export interface Factor {
  id: string;
  name: string;
  levels: string[];
}

export interface TreatmentCombination {
  TID: string;
  [key: string]: string; // Factor names and their corresponding levels
}

export interface FactorialResult {
  factors: Factor[];
  combinations: TreatmentCombination[];
  totalTreatments: number;
  recommendedReps: number;
  totalPlots: number;
}
