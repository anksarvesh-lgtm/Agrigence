export type DesignType = 'CRD' | 'RCBD' | 'Factorial RCBD' | 'Split Plot';

export interface Treatment {
  id: string;
  code: string;
  description: string;
}

export interface Factor {
  id: string;
  name: string;
  levels: string[];
}

export interface Plot {
  plotNumber: number;
  block: number;
  treatment: string;
  mainPlot?: string;
  subPlot?: string;
}

export interface LayoutResult {
  plots: Plot[];
  totalArea: number;
  rows: number;
  cols: number;
}
