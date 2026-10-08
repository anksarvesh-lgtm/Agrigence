export function generateFactorial(factors: Record<string, string[]>): any[] {
  const keys = Object.keys(factors);
  if (keys.length === 0) return [];

  let result: any[] = [{}];

  keys.forEach(key => {
    const levels = factors[key];
    let temp: any[] = [];

    result.forEach(r => {
      levels.forEach((level: string) => {
        temp.push({ ...r, [key]: level });
      });
    });

    result = temp;
  });

  return result;
}
