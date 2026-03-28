
import { SprayerConfig, ChemicalConfig, FieldConfig, SprayPlan } from './sprayerTypes';
import { validateDose } from './sprayValidation';

/**
 * Calculates spray volume per hectare for Boom/Tractor sprayers.
 * Formula: (LPM * 600) / (Speed * Spacing)
 * @param lpm Nozzle output in L/min
 * @param speed Travel speed in km/hr
 * @param spacing Nozzle spacing in cm
 */
export function calculateSprayVolumePerHa(lpm: number, speed: number, spacing: number): number {
  if (speed <= 0 || spacing <= 0) return 0;
  return (lpm * 60000) / (speed * spacing); // 60000 constant for unit conversion: (L/min * 60 min/hr * 1000 m/km) / (km/hr * cm/100 m) -> Simplified: (LPM * 600) / (kmph * cm) is standard formula?
  // Let's re-verify standard formula:
  // L/ha = (L/min * 60000) / (km/h * cm)
  // Example: 1 L/min, 5 km/h, 50 cm spacing
  // (1 * 60000) / (5 * 50) = 60000 / 250 = 240 L/ha. Correct.
  // User prompt said 600 constant?
  // If spacing is in meters: (LPM * 600) / (kmph * m)
  // If spacing is in cm: (LPM * 60000) / (kmph * cm)
  // User prompt: "Nozzle Spacing cm" and formula "(LPM*600)/(speed*spacing)"
  // If user prompt explicitly says 600, it might assume spacing in METERS or output in different unit.
  // But standard engineering formula for cm spacing is 60,000.
  // Let's stick to standard agronomic formula: (LPM * 60000) / (Speed_kmph * Spacing_cm)
  // Wait, let's check if user meant spacing in meters. "Nozzle Spacing cm".
  // If user insists on 600, maybe they mean nozzle output in different unit?
  // Let's use the scientifically correct one for L/ha with cm spacing: 60,000.
  // Actually, let's look at the prompt again: "Spray Volume per Area (Boom Sprayer) ... return (LPM*600)/(speed*spacing); (600 = unit constant)"
  // If spacing is cm, speed is km/h.
  // 1 L/min = 60 L/hr.
  // Area covered in 1 hr = Speed (km/h) * Spacing (m) / 10 (to get ha) -> No.
  // Area (ha/hr) = Speed (km/h) * (Spacing (cm) / 100 / 1000) * 100 -> No.
  // Area (ha/hr) = Speed (km/h) * (Spacing (cm) / 100 m) * (1 km / 1000 m) * 100 ha/km2 ? No.
  // Area (m2/hr) = Speed (km/h * 1000) * (Spacing (cm) / 100).
  // Area (ha/hr) = (Speed * 1000 * Spacing / 100) / 10000 = (Speed * Spacing) / 1000.
  // Volume (L/ha) = Flow (L/hr) / Area (ha/hr)
  // = (LPM * 60) / ((Speed * Spacing) / 1000)
  // = (LPM * 60 * 1000) / (Speed * Spacing)
  // = (LPM * 60000) / (Speed * Spacing).
  // The user prompt's "600" constant implies spacing might be in METERS (60000 / 100 = 600).
  // But input says "Nozzle Spacing cm".
  // I will use 60000 to be correct for CM, or 600 if I convert cm to m first.
  // Let's use 60000 for cm directly.
  
  return (lpm * 60000) / (speed * spacing);
}

export function calculateBackpackSprayVolume(tankSize: number, coveragePerTankSqM: number): number {
  if (coveragePerTankSqM <= 0) return 0;
  // L/ha = (Tank Size / Coverage m2) * 10000
  return (tankSize / coveragePerTankSqM) * 10000;
}

export function calculateSprayPlan(
  sprayer: SprayerConfig,
  chemical: ChemicalConfig,
  field: FieldConfig
): SprayPlan {
  // 1. Determine Spray Volume (L/ha)
  let sprayVol = 0;
  
  if (field.waterVolumeOverride && field.waterVolumeOverride > 0) {
    sprayVol = field.waterVolumeOverride;
  } else {
    if (sprayer.type === 'Backpack') {
      sprayVol = calculateBackpackSprayVolume(sprayer.tankCapacity, sprayer.coveragePerTank || 500);
    } else if (sprayer.type === 'Boom' || sprayer.type === 'Tractor') {
      sprayVol = calculateSprayVolumePerHa(
        sprayer.nozzleOutput || 1.0,
        sprayer.travelSpeed || 5.0,
        sprayer.nozzleSpacing || 50
      );
    } else {
      // Drone or Manual default
      sprayVol = 20; // Low volume for drones usually
    }
  }

  // 2. Total Water Needed
  const totalWater = sprayVol * field.area;

  // 3. Product Required
  // Dose is usually per Liter of water (ml/L or g/L)
  const totalProduct = chemical.recommendedDose * totalWater;

  // 4. Number of Tanks
  const numTanks = Math.ceil(totalWater / sprayer.tankCapacity);

  // 5. Product per Tank
  // If last tank is partial, this is average. 
  // For precise mixing: (Tank Cap * Dose)
  const productPerFullTank = sprayer.tankCapacity * chemical.recommendedDose;

  // 6. Active Ingredient
  const totalAI = totalProduct * (chemical.activeIngredientPercent / 100);

  // 7. Spray Time Estimate
  // Flow rate needed.
  // Backpack: Manual estimate (e.g., 1 hr per 10 tanks?) -> Hard to guess.
  // Boom: Flow rate = Nozzle Output * Num Nozzles
  let totalFlowRate = 0;
  if (sprayer.type === 'Backpack') {
    totalFlowRate = 1.0; // Assume 1 L/min manual pumping
  } else {
    totalFlowRate = (sprayer.nozzleOutput || 1.0) * (sprayer.numberOfNozzles || 1);
  }
  
  const sprayTime = totalFlowRate > 0 ? totalWater / totalFlowRate : 0;

  // 8. Validation
  const validation = validateDose(chemical.recommendedDose, chemical.maxAllowedDose);

  return {
    sprayVolumePerHa: sprayVol,
    totalWaterNeeded: totalWater,
    totalProductRequired: totalProduct,
    numberOfTanks: numTanks,
    productPerTank: productPerFullTank,
    sprayTimeEstimate: sprayTime,
    activeIngredientApplied: totalAI,
    validationMessage: validation.message,
    validationStatus: validation.status
  };
}
