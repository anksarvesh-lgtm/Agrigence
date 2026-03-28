export function interactionLines(data: any[]) {
  // data should be { factorA: string, factorB: string, value: number }
  const lines: Record<string, { xLabel: string, value: number }[]> = {};
  
  data.forEach(d => {
    if (!lines[d.factorB]) lines[d.factorB] = [];
    lines[d.factorB].push({ xLabel: d.factorA, value: d.value });
  });
  
  return lines;
}
