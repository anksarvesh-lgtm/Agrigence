export function LSD(tValue: number, mse: number, r: number): number {
  if (r <= 0 || mse < 0) return 0;
  return tValue * Math.sqrt((2 * mse) / r);
}

export function CV(mse: number, grandMean: number): number {
  if (grandMean === 0 || mse < 0) return 0;
  return (Math.sqrt(mse) / grandMean) * 100;
}

export function assignGroupings(means: {treatment: string, mean: number}[], lsd: number) {
  if (means.length === 0) return [];
  
  const sorted = [...means].sort((a, b) => b.mean - a.mean);
  
  let currentGroup = 'A';
  let currentMax = sorted[0].mean;
  
  return sorted.map((item, index) => {
    if (index === 0) return { ...item, grouping: currentGroup };
    
    if (currentMax - item.mean > lsd) {
      currentGroup = String.fromCharCode(currentGroup.charCodeAt(0) + 1);
      currentMax = item.mean;
    }
    return { ...item, grouping: currentGroup };
  });
}
