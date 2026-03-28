
import { SoilTestData, SelectedMaterial, NutrientResult } from './nutrientTypes';

export function validateNutrients(
  soilData: SoilTestData, 
  selected: SelectedMaterial[], 
  result: NutrientResult
) {
  const warnings: string[] = [];

  // Organic N cannot exceed 50% of total N
  const organicN = selected
    .filter(s => s.material.category === 'Organic')
    .reduce((sum, s) => sum + (s.qty * (s.material.N / 100) * s.material.efficiency), 0);
  
  if (organicN > (result.supplied.N * 0.5)) {
    warnings.push("Organic N contribution exceeds 50% of total N supply. Consider balancing with chemical sources.");
  }

  // If K < critical → show urgent correction
  if (soilData.availableK < 120) {
    warnings.push("Soil K is critically low (<120 kg/ha). Urgent potash correction required.");
  }

  // If only chemicals used → recommend SOC builder
  const hasOrganic = selected.some(s => s.material.category === 'Organic');
  if (!hasOrganic && selected.length > 0) {
    warnings.push("Only chemical fertilizers selected. Recommend adding FYM or Vermicompost to build Soil Organic Carbon (SOC).");
  }

  // If supply <80% requirement → flag under-fertilization
  if (result.supplied.N < (result.required.N * 0.8) && result.required.N > 0) {
    warnings.push("N supply is below 80% of STCR requirement. Risk of under-fertilization.");
  }
  if (result.supplied.P < (result.required.P * 0.8) && result.required.P > 0) {
    warnings.push("P supply is below 80% of STCR requirement. Risk of under-fertilization.");
  }
  if (result.supplied.K < (result.required.K * 0.8) && result.required.K > 0) {
    warnings.push("K supply is below 80% of STCR requirement. Risk of under-fertilization.");
  }

  // pH correction advisory
  if (soilData.pH < 6.0) {
    warnings.push("Soil is acidic (pH < 6.0). Consider applying lime for better nutrient availability.");
  } else if (soilData.pH > 8.5) {
    warnings.push("Soil is alkaline (pH > 8.5). Consider applying gypsum for better nutrient availability.");
  }

  return warnings;
}
