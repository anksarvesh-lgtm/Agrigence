
export function calculatePLS(purity: number, germination: number) {
  return (purity * germination) / 100;
}

export function bulkRequired(pls: number) {
  if (pls === 0) return 0;
  return 100 / pls;
}

export function costPerPLS(price: number, bulk: number) {
  return price * bulk;
}

export function sowingRate(
  targetPopulation: number,
  tgWeight: number,
  germination: number,
  emergence: number
) {
  if (germination === 0 || emergence === 0) return 0;
  return (targetPopulation * tgWeight) / (germination * emergence);
}

export function adjustedSowingRate(sr: number, hardSeed: number) {
  return sr * (1 + hardSeed / 100);
}

export function totalSeed(sr: number, area: number) {
  return sr * area;
}
