// solar.js - Compute sunrise and sunset with high precision

const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440587.5;  // Julian day at Unix epoch
const J2000 = 2451545.0;  // Julian day at 2000-01-01 12:00 UTC

/**
 * Convert JS Date to Julian Day
 * @param {Date} date
 * @returns {number} Julian day
 */
function toJulian(date) {
  return date.valueOf() / DAY_MS - 0.5 + J1970;
}

/**
 * Convert Julian Day to JS Date
 * @param {number} j
 * @returns {Date}
 */
function fromJulian(j) {
  return new Date((j + 0.5 - J1970) * DAY_MS);
}

/**
 * Solar mean anomaly
 * @param {number} d - Days since J2000
 * @returns {number} radians
 */
function solarMeanAnomaly(d) {
  return RAD * (357.5291 + 0.98560028 * d);
}

/**
 * Equation of center for the Sun
 * @param {number} M - Mean anomaly in radians
 * @returns {number} radians
 */
function equationOfCenter(M) {
  return RAD * (
    1.9148 * Math.sin(M) +
    0.0200 * Math.sin(2 * M) +
    0.0003 * Math.sin(3 * M)
  );
}

/**
 * Sun ecliptic longitude
 * @param {number} M - Mean anomaly in radians
 * @returns {number} radians
 */
function eclipticLongitude(M) {
  const C = equationOfCenter(M);
  const P = RAD * 102.9372; // perihelion of the Earth
  return M + C + P + Math.PI;
}

/**
 * Sun declination
 * @param {number} L - Ecliptic longitude in radians
 * @returns {number} radians
 */
function sunDeclination(L) {
  return Math.asin(Math.sin(L) * Math.sin(RAD * 23.44));
}

/**
 * Hour angle for given latitude and declination
 * @param {number} lat - Latitude in radians
 * @param {number} dec - Sun declination in radians
 * @returns {number} radians
 */
function hourAngle(lat, dec) {
  // -0.83° accounts for atmospheric refraction and Sun radius
  return Math.acos(
    (Math.sin(RAD * -0.83) - Math.sin(lat) * Math.sin(dec)) /
    (Math.cos(lat) * Math.cos(dec))
  );
}

/**
 * Compute sunrise and sunset for a given date and location
 * @param {Date} date
 * @param {number} lat - Latitude in decimal degrees
 * @param {number} lon - Longitude in decimal degrees
 * @returns {{sunrise: Date, sunset: Date}}
 */
function getSunTimes(date, lat, lon) {
  const phi = RAD * lat;
  const lw = RAD * -lon;

  const d = toJulian(date) - J2000; // Days since J2000
  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);
  const dec = sunDeclination(L);
  const H = hourAngle(phi, dec);

  // Approximate solar noon in Julian days
  const Jtransit = J2000 + d + lw / (2 * Math.PI);
  const Jrise = Jtransit - H / (2 * Math.PI);
  const Jset = Jtransit + H / (2 * Math.PI);

  return {
    sunrise: fromJulian(Jrise),
    sunset: fromJulian(Jset)
  };
}
