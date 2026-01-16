function getSunTimes(date, lat, lon) {
  const rad = Math.PI / 180;
  const J1970 = 2440588;
  const J2000 = 2451545;

  function toJulian(date) {
    return date.valueOf() / 86400000 - 0.5 + J1970;
  }

  function fromJulian(j) {
    return new Date((j + 0.5 - J1970) * 86400000);
  }

  function solarMeanAnomaly(d) {
    return rad * (357.5291 + 0.98560028 * d);
  }

  function equationOfCenter(M) {
    return rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M));
  }

  function eclipticLongitude(M) {
    return M + equationOfCenter(M) + rad * 102.9372 + Math.PI;
  }

  function sunDeclination(L) {
    return Math.asin(Math.sin(L) * Math.sin(rad * 23.44));
  }

  function hourAngle(lat, dec) {
    return Math.acos((Math.sin(rad * -0.83) - Math.sin(lat) * Math.sin(dec)) /
      (Math.cos(lat) * Math.cos(dec)));
  }

  const lw = rad * -lon;
  const phi = rad * lat;
  const d = toJulian(date) - J2000;

  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);
  const dec = sunDeclination(L);
  const H = hourAngle(phi, dec);

  const Jnoon = J2000 + d + lw / (2 * Math.PI);
  const Jrise = Jnoon - H / (2 * Math.PI);
  const Jset = Jnoon + H / (2 * Math.PI);

  return {
    sunrise: fromJulian(Jrise),
    sunset: fromJulian(Jset)
  };
}
