
export interface CostInputs {
  // Paid-Out Costs (A1 Components)
  hiredLabor: number;
  bullockLabor: number;
  machineLabor: number;
  seedCost: number;
  fertilizerCost: number;
  plantProtection: number;
  manureCost: number;
  irrigationCharges: number;
  landRevenue: number;
  depreciation: number;
  miscExpenses: number;
  
  // Interest Calculation
  workingCapitalDuration: number; // months
  interestRate: number; // annual %

  // Land & Capital
  rentPaidLeasedLand: number;
  rentalValueOwnedLand: number;
  interestOnFixedCapital: number; // Calculated or input directly

  // Family Labor
  familyLaborDays: number;
  imputedWageRate: number;

  // Output
  yieldObtained: number; // quintals
  marketPrice: number; // per quintal
  byProductIncome: number;
}

export interface CostResult {
  costA1: number;
  costA2: number;
  costB1: number;
  costB2: number;
  costC1: number;
  costC2: number;
  costC3: number;
  
  grossIncome: number;
  netIncome: number; // based on C3
  farmBusinessIncome: number; // Gross - A1
  familyLaborIncome: number; // Gross - B2
  
  costPerQuintal: number;
  breakEvenYield: number;
  profitMargin: number;
}

export interface ScenarioResult {
  priceIncrease: number; // +10% price
  priceDecrease: number; // -10% price
  yieldIncrease: number; // +15% yield
  yieldDecrease: number; // -10% yield
}
