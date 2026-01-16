const RAD = Math.PI / 180;

function normalize(deg) {
  return (deg % 360 + 360) % 360;
}

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function sunLongitude(date) {
  const d = julianDay(date) - 2451545.0;
  const L = normalize(280.460 + 0.9856474 * d);
  const g = normalize(357.528 + 0.9856003 * d);
  return normalize(
    L +
    1.915 * Math.sin(g * RAD) +
    0.020 * Math.sin(2 * g * RAD)
  );
}

function moonLongitude(date) {
  const d = julianDay(date) - 2451545.0;
  const L = normalize(218.316 + 13.176396 * d);
  const M = normalize(134.963 + 13.064993 * d);
  const F = normalize(93.272 + 13.229350 * d);
  return normalize(
    L +
    6.289 * Math.sin(M * RAD)
  );
}

function meanPlanetLongitude(d, base, rate) {
  return normalize(base + rate * d);
}

function planetLongitudes(date) {
  const d = julianDay(date) - 2451545.0;

  return {
    Sun: sunLongitude(date),
    Moon: moonLongitude(date),
    Mercury: meanPlanetLongitude(d, 252.250, 4.092338),
    Venus: meanPlanetLongitude(d, 181.979, 1.602130),
    Mars: meanPlanetLongitude(d, 355.433, 0.524039),
    Jupiter: meanPlanetLongitude(d, 34.351, 0.083056),
    Saturn: meanPlanetLongitude(d, 50.077, 0.033459)
  };
}
