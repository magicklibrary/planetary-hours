// solar.js
const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440587.5;
const J2000 = 2451545.0;

function toJulian(date) {
  return date.valueOf() / DAY_MS - 0.5 + J1970;
}

function fromJulian(j) {
  return new Date((j + 0.5 - J1970) * DAY_MS);
}

// Solar mean anomaly
function solarMeanAnomaly(d) {
  return RAD * (357.5291 + 0.98560028 * d);
}

// Equation of center
function equationOfCenter(M) {
  return RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
}

// Ecliptic longitude
function eclipticLongitude(M) {
  const C = equationOfCenter(M);
  const P = RAD * 102.9372; // perihelion of the Earth
  return M + C + P + Math.PI;
}

// Sun declination
function sunDeclination(L) {
  return Math.asin(Math.sin(L) * Math.sin(RAD * 23.44));
}

// Hour angle
function hourAngle(lat, dec) {
  return Math.acos((Math.sin(RAD * -0.83) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec)));
}

// Main function: get sunrise and sunset
function getSunTimes(date, lat, lon) {
  const phi = RAD * lat;
  const lw = RAD * -lon;

  const d = toJulian(date) - J2000;
  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);
  const dec = sunDeclination(L);
  const H = hourAngle(phi, dec);

  // Approximate solar noon in Julian days
  const Jtransit = J2000 + d + (lw / (2 * Math.PI));
  const Jrise = Jtransit - H / (2 * Math.PI);
  const Jset = Jtransit + H / (2 * Math.PI);

  return {
    sunrise: fromJulian(Jrise),
    sunset: fromJulian(Jset)
  };
}
