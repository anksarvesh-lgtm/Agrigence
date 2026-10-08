export type UnitType = 'kg/ha' | 'g/ha' | 'L/ha' | 'ml/ha' | 'ppm' | '%' | 'ml/L' | 'g/L';

export function convertToDose(
  rate: number, 
  unit: UnitType, 
  plotAreaM2: number, 
  sprayVolumeL: number, 
  isAi: boolean, 
  aiPercent: number
): { plotDose: number, displayUnit: string } {
  
  let dose = 0;
  let displayUnit = '';

  switch (unit) {
    case 'kg/ha':
      dose = ((rate * 1000) * plotAreaM2) / 10000;
      displayUnit = 'g/plot';
      break;
    case 'g/ha':
      dose = (rate * plotAreaM2) / 10000;
      displayUnit = 'g/plot';
      break;
    case 'L/ha':
      dose = ((rate * 1000) * plotAreaM2) / 10000;
      displayUnit = 'ml/plot';
      break;
    case 'ml/ha':
      dose = (rate * plotAreaM2) / 10000;
      displayUnit = 'ml/plot';
      break;
    case 'ppm':
      dose = (rate * sprayVolumeL) / 1000;
      displayUnit = 'g/plot';
      break;
    case '%':
      dose = (rate / 100) * sprayVolumeL * 1000;
      displayUnit = 'ml or g/plot';
      break;
    case 'ml/L':
      dose = rate * sprayVolumeL;
      displayUnit = 'ml/plot';
      break;
    case 'g/L':
      dose = rate * sprayVolumeL;
      displayUnit = 'g/plot';
      break;
  }

  if (isAi && aiPercent > 0) {
    dose = dose / (aiPercent / 100);
  }

  return { plotDose: dose, displayUnit };
}
