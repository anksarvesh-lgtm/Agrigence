
import { FertilizerMaterial } from '../Tool02Nutrient/nutrientTypes';

export interface INMSource {
  id: string;
  material: FertilizerMaterial;
  maxQty: number;
  price: number;
}

export interface INMSettings {
  maxOrganicSubstitution: number; // percentage (0-100)
  budgetLimit?: number;
  sustainabilityPriority: number; // 1-10
}

export interface INMRequirement {
  N: number;
  P: number;
  K: number;
}

export interface LPModel {
  A: number[][]; // Constraint coefficients
  b: number[];   // RHS values
  c: number[];   // Objective coefficients
  constraintTypes: ('LE' | 'GE' | 'EQ')[];
}

export interface LPSolution {
  status: 'OPTIMAL' | 'INFEASIBLE' | 'UNBOUNDED' | 'ERROR';
  variables: number[];
  objectiveValue: number;
  supplied: { N: number; P: number; K: number };
  organicShare: number;
  cost: number;
}
