
export function requiredN(NR: number, CF: number, T: number, CS: number, SN: number) {
  return ((NR / CF) * 100 * T) - ((CS / 100) * SN);
}

export function requiredP(NR: number, CF: number, T: number, CS: number, SP: number) {
  return ((NR / CF) * 100 * T) - ((CS / 100) * SP);
}

export function requiredK(NR: number, CF: number, T: number, CS: number, SK: number) {
  return ((NR / CF) * 100 * T) - ((CS / 100) * SK);
}
