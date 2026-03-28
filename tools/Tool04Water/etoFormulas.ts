
export function saturationVaporPressure(T: number) {
  return 0.6108 * Math.exp((17.27 * T) / (T + 237.3));
}

export function slopeVPcurve(T: number) {
  const es = saturationVaporPressure(T);
  return (4098 * es) / Math.pow(T + 237.3, 2);
}

export function actualVaporPressure(es: number, RH: number) {
  return (RH / 100) * es;
}

/**
 * FAO-56 Penman-Monteith ET0 Equation
 * @param delta Slope of vapor pressure curve [kPa/°C]
 * @param Rn Net radiation at the crop surface [MJ/m²/day]
 * @param G Soil heat flux density [MJ/m²/day] (usually 0 for daily)
 * @param gamma Psychrometric constant [kPa/°C] (default 0.665)
 * @param T Mean daily air temperature at 2 m height [°C]
 * @param u2 Wind speed at 2 m height [m/s]
 * @param es Saturation vapor pressure [kPa]
 * @param ea Actual vapor pressure [kPa]
 */
export function calculateEto(
  delta: number,
  Rn: number,
  G: number,
  gamma: number,
  T: number,
  u2: number,
  es: number,
  ea: number
) {
  return (
    (0.408 * delta * (Rn - G)) +
    (gamma * (900 / (T + 273)) * u2 * (es - ea))
  ) / (delta + gamma * (1 + 0.34 * u2));
}
