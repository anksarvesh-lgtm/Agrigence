export function validateDoseInputs(plotArea: number, rate: number, aiPercent?: number, ppm?: number): string[] {
  const warnings: string[] = [];
  
  if (plotArea > 0 && plotArea < 1) {
    warnings.push("Microplot precision: Plot area is less than 1 m². Ensure highly accurate weighing scales are used.");
  }
  
  if (rate === 0) {
    warnings.push("Invalid rate: Rate cannot be 0.");
  }
  
  if (aiPercent !== undefined && aiPercent > 100) {
    warnings.push("Error: Active Ingredient percentage cannot exceed 100%.");
  }
  
  if (ppm !== undefined && ppm > 10000) {
    warnings.push("Unrealistic PPM: PPM value exceeds 10,000 (1%). Verify the concentration.");
  }
  
  return warnings;
}
