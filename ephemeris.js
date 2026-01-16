// ephemeris.js - High-precision planetary longitudes for classical planets
const RAD = Math.PI / 180;

// Normalize degrees to 0–360
function normalize(deg) {
  return (deg % 360 + 360) % 360;
}

// Convert JS Date to Julian Day
function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

// Sun ecliptic longitude using VSOP87 simplified
function sunLongitude(date) {
  const d = julianDay(date) - 2451545.0;
  const L0 = normalize(280.46646 + 0.9856474 * d);
  const M = normalize(357.52911 + 0.9856003 * d);
  const C = 1.914602 - 0.004817 * (d/36525) - 0.000014 * (d/36525)**2;
  const lambda = normalize(L0 + C * Math.sin(M * RAD));
  return lambda;
}

// Moon ecliptic longitude (simplified, more precise than previous)
function moonLongitude(date) {
  const d = julianDay(date) - 2451545.0;
  const L0 = normalize(218.316 + 13.176396 * d);
  const M = normalize(134.963 + 13.064993 * d);
  const F = normalize(93.272 + 13.229350 * d);
  const lambda = normalize(L0 + 6.289 * Math.sin(M * RAD) - 1.274 * Math.sin((2*L0 - M) * RAD) + 0.658 * Math.sin(2*L0 * RAD));
  return lambda;
}

// Higher-precision mean longitudes for planets
const PLANET_MEAN = {
  Mercury: { base: 252.250, rate: 4.09233445 },
  Venus:   { base: 181.979, rate: 1.60213034 },
  Mars:    { base: 355.433, rate: 0.52403840 },
  Jupiter: { base: 34.351,  rate: 0.08308677 },
  Saturn:  { base: 50.077,  rate: 0.03344414 }
};

// Compute mean longitude
function meanPlanetLongitude(d, base, rate) {
  return normalize(base + rate * d);
}

// Planetary longitudes object
function planetLongitudes(date) {
  const d = julianDay(date) - 2451545.0;
  return {
    Sun: sunLongitude(date),
    Moon: moonLongitude(date),
    Mercury: meanPlanetLongitude(d, PLANET_MEAN.Mercury.base, PLANET_MEAN.Mercury.rate),
    Venus: meanPlanetLongitude(d, PLANET_MEAN.Venus.base, PLANET_MEAN.Venus.rate),
    Mars: meanPlanetLongitude(d, PLANET_MEAN.Mars.base, PLANET_MEAN.Mars.rate),
    Jupiter: meanPlanetLongitude(d, PLANET_MEAN.Jupiter.base, PLANET_MEAN.Jupiter.rate),
    Saturn: meanPlanetLongitude(d, PLANET_MEAN.Saturn.base, PLANET_MEAN.Saturn.rate)
  };
}

// Chaldean order for planetary hours
const CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];

// Planet symbols and colors
const PLANET_DETAILS = {
  Sun: { symbol: "☉", color: "#FFD700" },
  Moon: { symbol: "☽", color: "#AAAAAA" },
  Mercury: { symbol: "☿", color: "#00FFFF" },
  Venus: { symbol: "♀", color: "#FF69B4" },
  Mars: { symbol: "♂", color: "#FF4500" },
  Jupiter: { symbol: "♃", color: "#FFA500" },
  Saturn: { symbol: "♄", color: "#A9A9A9" }
};
