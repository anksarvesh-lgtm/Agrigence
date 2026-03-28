export function errorBar(mean: number, lsd: number) {
  return {
    upper: mean + lsd / 2,
    lower: mean - lsd / 2
  };
}
