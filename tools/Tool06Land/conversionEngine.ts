
import { UNIVERSAL_CONSTANTS } from './conversionConstants';
import { REGION_DATABASE } from './regionDatabase';

/**
 * Converts any value from a given unit to Hectare.
 * @param value The numeric value to convert
 * @param unit The unit name (e.g., 'Acre', 'Bigha')
 * @param region The specific region (e.g., 'Uttar Pradesh')
 * @param subRegion The specific sub-region (e.g., 'Western UP')
 */
export function toHectare(value: number, unit: string, region?: string, subRegion?: string): number {
  if (unit === 'Hectare') return value;
  if (unit === 'Acre') return value * UNIVERSAL_CONSTANTS.ACRE;
  if (unit === 'Square Meter') return value * UNIVERSAL_CONSTANTS.SQ_METER;
  if (unit === 'Square Feet') return value * UNIVERSAL_CONSTANTS.SQ_FEET;
  if (unit === 'Square Kilometer') return value * UNIVERSAL_CONSTANTS.SQ_KM;

  // Regional Logic
  if (region && REGION_DATABASE[region]) {
    const regionData = REGION_DATABASE[region];
    
    // Check Sub-Region first if provided
    if (subRegion && regionData.subRegions && regionData.subRegions[subRegion]) {
      const factor = regionData.subRegions[subRegion][unit];
      if (factor) return value * factor;
    }

    // Check Region-level units
    const factor = regionData.units[unit];
    if (factor) return value * factor;
  }

  // Fallback to Standard Constants if no region match found but unit is known
  // (e.g., user selects 'Bigha' but no region -> use standard approx)
  if (unit.includes('Bigha')) return value * UNIVERSAL_CONSTANTS.BIGHA_STD;
  if (unit.includes('Guntha') || unit.includes('Gunta')) return value * UNIVERSAL_CONSTANTS.GUNTHA_STD;
  if (unit.includes('Kanal')) return value * UNIVERSAL_CONSTANTS.KANAL_STD;
  if (unit.includes('Marla')) return value * UNIVERSAL_CONSTANTS.MARLA_STD;
  if (unit.includes('Biswa')) return value * UNIVERSAL_CONSTANTS.BISWA_STD;

  return 0; // Unknown unit
}

/**
 * Converts Hectare to all standard and regional units.
 * @param ha Value in Hectares
 * @param region Optional region for specific reverse conversion
 */
export function fromHectare(ha: number, region?: string, subRegion?: string) {
  const base = {
    hectare: ha,
    acre: ha / UNIVERSAL_CONSTANTS.ACRE,
    sqm: ha / UNIVERSAL_CONSTANTS.SQ_METER,
    sqft: ha / UNIVERSAL_CONSTANTS.SQ_FEET,
    sqkm: ha / UNIVERSAL_CONSTANTS.SQ_KM,
  };

  let regional: Record<string, number> = {};

  if (region && REGION_DATABASE[region]) {
    const regionData = REGION_DATABASE[region];
    
    // Add sub-region specific units if applicable
    if (subRegion && regionData.subRegions && regionData.subRegions[subRegion]) {
      Object.entries(regionData.subRegions[subRegion]).forEach(([u, factor]) => {
        regional[u] = ha / factor;
      });
    } 
    // Add region-wide units
    else {
      Object.entries(regionData.units).forEach(([u, factor]) => {
        regional[u] = ha / factor;
      });
    }
  }

  return { ...base, regional };
}
