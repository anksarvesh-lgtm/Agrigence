export function scale(value: number, max: number, height: number): number {
  if (max === 0) return 0;
  return (value / max) * height;
}

export function generateYAxisTicks(max: number, ticksCount: number = 5): number[] {
  const ticks = [];
  const step = max / ticksCount;
  for (let i = 0; i <= ticksCount; i++) {
    ticks.push(i * step);
  }
  return ticks;
}
