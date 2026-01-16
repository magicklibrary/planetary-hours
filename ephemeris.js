function getSunLongitude(date) {
  const rad = Math.PI / 180;

  const JD = date.getTime() / 86400000 + 2440587.5;
  const n = JD - 2451545.0;

  const L = (280.460 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;

  const lambda =
    L +
    1.915 * Math.sin(g * rad) +
    0.020 * Math.sin(2 * g * rad);

  return (lambda + 360) % 360;
}
