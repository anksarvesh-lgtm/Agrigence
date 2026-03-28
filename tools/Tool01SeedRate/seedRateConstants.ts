
import { CropType, AreaUnit } from './seedRateTypes';

export const AREA_CONVERSION: Record<AreaUnit, number> = {
  Hectare: 1,
  Acre: 0.4047,
  Bigha: 0.25 // default UP average unless region specified
};

export const CROP_TYPES: CropType[] = ['Wheat', 'Rice', 'Maize', 'Barley', 'Other'];
export const AREA_UNITS: AreaUnit[] = ['Hectare', 'Acre', 'Bigha'];
