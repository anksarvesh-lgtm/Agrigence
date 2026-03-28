
export interface LandUnit {
  id: string;
  name: string;
  factorToHa: number; // Conversion factor to Hectare
  region?: string;
  subRegion?: string;
}

export interface LandConversionResult {
  hectare: number;
  acre: number;
  sqm: number;
  sqft: number;
  sqkm: number;
  bighaStandard: number; // Approx standard bigha
  guntha: number;
}

export interface RegionConfig {
  name: string;
  units: Record<string, number>; // Unit Name -> Factor to Ha
  subRegions?: Record<string, Record<string, number>>; // SubRegion Name -> { Unit -> Factor }
}
