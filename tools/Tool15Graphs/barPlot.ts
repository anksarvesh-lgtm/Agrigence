export function createBarPositions(data: any[], width: number, padding: number = 0.2) {
  const step = width / data.length;
  const barWidth = step * (1 - padding);
  const offset = step * (padding / 2);
  
  return data.map((d, i) => ({
    x: i * step + offset,
    width: barWidth,
    height: d.value,
    label: d.label,
    grouping: d.grouping,
    lsd: d.lsd
  }));
}
