
import { INMSource, INMSettings } from './inmTypes';

export function buildObjective(sources: INMSource[], settings: INMSettings): number[] {
  // Minimize: Sum(xi * price_i) - (lambda * Sum(xi * OC_i))
  // lambda = (sustainabilityPriority - 1) * 2 (scaling factor)
  const lambda = settings.sustainabilityPriority > 1 ? (settings.sustainabilityPriority - 1) * 2 : 0;

  return sources.map(s => {
    const price = s.price;
    // Estimate OC: Organic materials ~20%, Chemical 0%
    const ocFactor = s.material.category === 'Organic' ? 0.2 : 0;
    // Objective coefficient: price - (lambda * ocFactor)
    // Since we minimize, a lower coefficient is better.
    return price - (lambda * ocFactor);
  });
}
