
export function validateDose(dose: number, maxDose: number): { status: 'SAFE' | 'WARNING' | 'DANGER'; message: string } {
  if (dose > maxDose) {
    return { status: 'DANGER', message: 'ERROR: Exceeds label recommendation. Reduce dose immediately.' };
  }
  if (dose < 0.5 * maxDose) {
    return { status: 'WARNING', message: 'Warning: Dose may be ineffective (Under-dose).' };
  }
  return { status: 'SAFE', message: 'Dose within safe and effective range.' };
}
