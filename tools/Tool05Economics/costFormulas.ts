
import { CostInputs, CostResult } from './economicsTypes';

/**
 * Calculates Cost A1: All actual expenses in cash and kind incurred in production by owner operator.
 */
export function calculateCostA1(data: CostInputs): number {
  const directCosts = 
    data.hiredLabor +
    data.bullockLabor +
    data.machineLabor +
    data.seedCost +
    data.fertilizerCost +
    data.plantProtection +
    data.manureCost +
    data.irrigationCharges +
    data.landRevenue +
    data.depreciation +
    data.miscExpenses;

  // Interest on working capital
  // Typically calculated for the duration of the crop season
  const interest = directCosts * (data.interestRate / 100) * (data.workingCapitalDuration / 12);

  return directCosts + interest;
}

/**
 * Calculates Cost A2: Cost A1 + Rent paid for leased-in land.
 */
export function calculateCostA2(costA1: number, rentPaid: number): number {
  return costA1 + rentPaid;
}

/**
 * Calculates Cost B1: Cost A1 + Interest on value of owned fixed capital assets (excluding land).
 */
export function calculateCostB1(costA1: number, interestOnFixedCapital: number): number {
  return costA1 + interestOnFixedCapital;
}

/**
 * Calculates Cost B2: Cost B1 + Rental value of owned land (net of land revenue) + Rent paid for leased-in land.
 * Note: Often defined as Cost B1 + Rental value of owned land + Rent paid for leased-in land.
 * However, standard definition: Cost B2 = Cost B1 + Rental value of owned land + Rent paid for leased-in land.
 * Let's stick to the user request: Cost B2 = B1 + rentalValue + rentPaid.
 * Wait, usually B1 includes interest on fixed capital. 
 * Let's follow the user's specific request structure if provided, or standard agricultural economics definitions.
 * User request: "Cost B2: B1 + rentalValue + rentPaid"
 * Actually, standard definition is:
 * Cost B1 = Cost A1 + Interest on value of owned fixed capital assets (excluding land).
 * Cost B2 = Cost B1 + Rental value of owned land + Rent paid for leased-in land.
 * 
 * Wait, Cost A2 includes Rent Paid. So if we add Rent Paid again to B2, it might be double counting if B2 is derived from A2.
 * But B1 is derived from A1.
 * Let's follow the user's formula:
 * 5. Cost B2: return B1 + rentalValue + rentPaid;
 * This implies B1 does NOT include rent paid. Correct, B1 is A1 + interest.
 */
export function calculateCostB2(costB1: number, rentalValue: number, rentPaid: number): number {
  return costB1 + rentalValue + rentPaid;
}

/**
 * Calculates Cost C1: Cost B1 + Imputed value of family labor.
 */
export function calculateCostC1(costB1: number, familyLaborValue: number): number {
  return costB1 + familyLaborValue;
}

/**
 * Calculates Cost C2: Cost B2 + Imputed value of family labor.
 */
export function calculateCostC2(costB2: number, familyLaborValue: number): number {
  return costB2 + familyLaborValue;
}

/**
 * Calculates Cost C3: Cost C2 + 10% of Cost C2 (on account of managerial functions of farmer).
 */
export function calculateCostC3(costC2: number): number {
  return costC2 * 1.10;
}

export function calculateEconomics(data: CostInputs): CostResult {
  const costA1 = calculateCostA1(data);
  const costA2 = calculateCostA2(costA1, data.rentPaidLeasedLand);
  const costB1 = calculateCostB1(costA1, data.interestOnFixedCapital);
  // Note: User's request for B2: B1 + rentalValue + rentPaid.
  // Standard def: Cost B2 = Cost B1 + Rental value of owned land + Rent paid for leased-in land.
  const costB2 = calculateCostB2(costB1, data.rentalValueOwnedLand, data.rentPaidLeasedLand);
  
  const familyLaborValue = data.familyLaborDays * data.imputedWageRate;
  
  const costC1 = calculateCostC1(costB1, familyLaborValue);
  const costC2 = calculateCostC2(costB2, familyLaborValue);
  const costC3 = calculateCostC3(costC2);

  const grossIncome = (data.yieldObtained * data.marketPrice) + data.byProductIncome;
  
  // Net Income is usually Gross Income - Cost C3 (True Profit)
  const netIncome = grossIncome - costC3;
  
  // Farm Business Income = Gross Income - Cost A1 (Profit & Loss Account)
  const farmBusinessIncome = grossIncome - costA1;
  
  // Family Labor Income = Gross Income - Cost B2
  const familyLaborIncome = grossIncome - costB2;

  const costPerQuintal = data.yieldObtained > 0 ? costC3 / data.yieldObtained : 0;
  const breakEvenYield = data.marketPrice > 0 ? costC3 / data.marketPrice : 0;
  const profitMargin = data.marketPrice > 0 ? ((data.marketPrice - costPerQuintal) / data.marketPrice) * 100 : 0;

  return {
    costA1,
    costA2,
    costB1,
    costB2,
    costC1,
    costC2,
    costC3,
    grossIncome,
    netIncome,
    farmBusinessIncome,
    familyLaborIncome,
    costPerQuintal,
    breakEvenYield,
    profitMargin
  };
}
