// solar.js - High-precision sunrise and sunset calculation

const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440587.5;  // Julian date at Unix epoch
const J2000 = 2451545.0;  // Julian date at 2000-01-01 12:00 UT

/**
 * Convert Date to Julian day
 * @param {Date} date
 * @returns {number}
 */
function toJulian(date) {
  return date.valueOf() / DAY_MS - 0.5 + J1970;
}

/**
 * Convert Julian day to Date
 * @param {number} j
 * @returns {Date}
 */
function fromJulian(j) {
  return new Date((j + 0.5 - J1970) * DAY_MS);
}

/**
 * Solar mean anomaly (radians)
 * @param {number} d - days since J2000
 * @returns {number}
 */
function solarMeanAnomaly(d) {
  return RAD * (357.5291 + 0.98560028 * d);
}

/**
 * Equation of center (radians)
 * @param {number} M - mean anomaly
 * @returns {number}
 */
function equationOfCenter(M) {
  return RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
}

/**
 * Sun ecliptic longitude (radians)
 * @param {number} M - mean anomaly
 * @returns {number}
 */
function eclipticLongitude(M) {
  const C = equationOfCenter(M);
  const P = RAD * 102.9372; // perihelion of the Earth
  return M + C + P + Math.PI;
}

/**
 * Sun declination (radians)
 * @param {number} L - ecliptic longitude
 * @returns {number}
 */
function sunDeclination(L) {
  return Math.asin(Math.sin(L) * Math.sin(RAD * 23.44)); // Earth's obliquity
}

/**
 * Hour angle for given latitude and declination
 * @param {number} lat - radians
 * @param {number} dec - radians
 * @returns {number} - radians
 */
function hourAngle(lat, dec) {
  const h = (Math.sin(RAD * -0.83) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec));
  // Clamp to valid range to avoid NaN at extreme latitudes
  return Math.acos(Math.min(Math.max(h, -1), 1));
}

/**
 * Get sunrise and sunset for given date and location
 * @param {Date} date
 * @param {number} lat - degrees
 * @param {number} lon - degrees
 * @returns {{sunrise: Date, sunset: Date}}
 */
function getSunTimes(date, lat, lon) {
  const phi = RAD * lat;       // latitude in radians
  const lw = RAD * -lon;       // longitude west positive

  const d = toJulian(date) - J2000;
  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);
  const dec = sunDeclination(L);
  const H = hourAngle(phi, dec);

  // Approximate solar transit (noon)
  const Jtransit = J2000 + d + lw / (2 * Math.PI);

  // Sunrise and sunset in Julian days
  const Jrise = Jtransit - H / (2 * Math.PI);
  const Jset = Jtransit + H / (2 * Math.PI);

  return {
    sunrise: fromJulian(Jrise),
    sunset: fromJulian(Jset)
  };
}
