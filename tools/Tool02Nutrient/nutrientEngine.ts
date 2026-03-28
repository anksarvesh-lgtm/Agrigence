
import { FertilizerMaterial, SelectedMaterial } from './nutrientTypes';

export function nutrientSupply(qty: number, material: FertilizerMaterial) {
  return {
    N: qty * (material.N / 100) * material.efficiency,
    P: qty * (material.P / 100) * material.efficiency,
    K: qty * (material.K / 100) * material.efficiency
  };
}

export function totalSupply(selected: SelectedMaterial[]) {
  let total = { N: 0, P: 0, K: 0 };

  selected.forEach(s => {
    const c = nutrientSupply(s.qty, s.material);
    total.N += c.N;
    total.P += c.P;
    total.K += c.K;
  });

  return total;
}

export function totalCost(selected: SelectedMaterial[]) {
  return selected.reduce((sum, s) => sum + (s.qty * s.price), 0);
}

export function calculateGap(required: { N: number; P: number; K: number }, supplied: { N: number; P: number; K: number }) {
  return {
    N: Math.max(0, required.N - supplied.N),
    P: Math.max(0, required.P - supplied.P),
    K: Math.max(0, required.K - supplied.K)
  };
}
