export class SeededRNG {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  // Linear Congruential Generator
  // Using constants from Numerical Recipes
  public next(): number {
    const a = 1664525;
    const c = 1013904223;
    const m = 4294967296; // 2^32
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }

  public nextRange(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1));
  }

  // Box-Muller transform for normal distribution
  public nextGaussian(mean: number = 0, stdDev: number = 1): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next(); // Converting [0,1) to (0,1)
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  }
}

export const defaultRNG = new SeededRNG();
