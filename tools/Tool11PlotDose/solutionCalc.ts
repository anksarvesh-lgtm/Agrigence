export function ppmSolution(ppm: number, volumeL: number): number {
  return (ppm * volumeL) / 1000;
}

export function percentSolution(percent: number, volumeL: number): number {
  return (percent / 100) * volumeL * 1000;
}
