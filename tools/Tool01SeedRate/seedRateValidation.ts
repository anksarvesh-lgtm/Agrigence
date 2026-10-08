
export function validateSeed(input: any) {
  const warnings: string[] = [];

  if ((input.purity * input.germination) < 30)
    warnings.push("Seed lot not recommended (Low PLS)");

  if (input.purity < 80)
    warnings.push("Purity below commercial standard (80%)");

  if (input.germination < 70)
    warnings.push("Germination below commercial standard (70%)");

  if (input.emergence < 70)
    warnings.push("Low field emergence – check soil condition");

  if (input.hardSeed > 10)
    warnings.push("Pre-treatment recommended for hard seeds");

  return warnings;
}
