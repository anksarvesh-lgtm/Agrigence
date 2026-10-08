export function assignCodes(combinations: any[]): any[] {
  return combinations.map((combo, index) => ({
    TID: `T${index + 1}`,
    ...combo
  }));
}
