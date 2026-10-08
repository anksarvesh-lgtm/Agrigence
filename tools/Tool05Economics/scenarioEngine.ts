
import { CostInputs, CostResult } from './economicsTypes';
import { calculateEconomics } from './costFormulas';

export function runScenarios(data: CostInputs): {
  priceIncrease: CostResult;
  priceDecrease: CostResult;
  yieldIncrease: CostResult;
  yieldDecrease: CostResult;
} {
  // Scenario 1: Price + 10%
  const priceIncData = { ...data, marketPrice: data.marketPrice * 1.10 };
  const priceIncrease = calculateEconomics(priceIncData);

  // Scenario 2: Price - 10%
  const priceDecData = { ...data, marketPrice: data.marketPrice * 0.90 };
  const priceDecrease = calculateEconomics(priceDecData);

  // Scenario 3: Yield + 15%
  const yieldIncData = { ...data, yieldObtained: data.yieldObtained * 1.15 };
  const yieldIncrease = calculateEconomics(yieldIncData);

  // Scenario 4: Yield - 10%
  const yieldDecData = { ...data, yieldObtained: data.yieldObtained * 0.90 };
  const yieldDecrease = calculateEconomics(yieldDecData);

  return {
    priceIncrease,
    priceDecrease,
    yieldIncrease,
    yieldDecrease
  };
}
