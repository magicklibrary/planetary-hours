// planetary.js - Clean and fully functional version

// --- Chaldean order ---
const CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];

// --- Planet details ---
const PLANET_DETAILS = {
  Sun:     { symbol: "☉", color: "#FFD700" },
  Moon:    { symbol: "☽", color: "#B0E0E6" },
  Mercury: { symbol: "☿", color: "#C0C0C0" },
  Venus:   { symbol: "♀", color: "#FF69B4" },
  Mars:    { symbol: "♂", color: "#FF4500" },
  Jupiter: { symbol: "♃", color: "#FFA500" },
  Saturn:  { symbol: "♄", color: "#708090" }
};

// --- Dignities ---
const PLANET_EXALTATIONS = { Sun: "Aries", Moon: "Taurus", Mercury: "Virgo", Venus: "Pisces", Mars: "Capricorn", Jupiter: "Cancer", Saturn: "Libra" };
const PLANET_DETRIMENTS = { Sun: "Libra", Moon: "Scorpio", Mercury: "Pisces", Venus: "Virgo", Mars: "Taurus", Jupiter: "Capricorn", Saturn: "Cancer" };
const PLANET_FALLS = { Sun: "Libra", Moon: "Scorpio", Mercury: "Pisces", Venus: "Virgo", Mars: "Cancer", Jupiter: "Capricorn", Saturn: "Aries" };

/**
 * Get dignity of a planet in a zodiac
 */
function getDignity(planet, zodiac) {
  if (zodiac === PLANET_EXALTATIONS[planet]) return "Exaltation";
  if (zodiac === PLANET_DETRIMENTS[planet]) return "Detriment";
  if (zodiac === PLANET_FALLS[planet]) return "Fall";
  return "Rulership/Neutral";
}

/**
 * Compute planetary hour strength
 */
function getHourStrength(planet, zodiac, natalMatch = false) {
  let score = 1;
  const dignity = getDignity(planet, zodiac);
  if (dignity === "Exaltation") score += 2;
  if (dignity === "Rulership/Neutral") score += 1;
  if (dignity === "Detriment") score -= 1;
  if (dignity === "Fall") score -= 2;
  if (natalMatch) score += 1;
  return score;
}

/**
 * Generate 24 planetary hours for a given day
 * @param {string} dayRuler - Planet of the day (first hour)
 * @param {Date} sunrise
 * @param {Date} sunset
 * @returns {Array} [{ planet: {name,symbol,color}, start: Date, end: Date }]
 */
function generatePlanetaryHours(dayRuler, sunrise, sunset) {
  const hours = [];
  const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);

  const dayLength = (sunset - sunrise) / 12;
  const nightLength = (nextSunrise - sunset) / 12;

  let startIndex = CHALDEAN_ORDER.indexOf(dayRuler);
  if (startIndex === -1) startIndex = 0;

  for (let i = 0; i < 24; i++) {
    const planetIndex = (startIndex + i) % 7;
    const planetName = CHALDEAN_ORDER[planetIndex];
    const planet = PLANET_DETAILS[planetName];

    const start = new Date(i < 12 ? sunrise.getTime() + i * dayLength : sunset.getTime() + (i - 12) * nightLength);
    const end   = new Date(i < 12 ? sunrise.getTime() + (i + 1) * dayLength : sunset.getTime() + (i - 11) * nightLength);

    hours.push({ planet: { name: planetName, symbol: planet.symbol, color: planet.color }, start, end });
  }

  return hours;
}

/**
 * Get zodiac sign for a planet at a specific time
 * Requires planetLongitudes(date) and getZodiacFromLongitude(longitude)
 */
function getPlanetZodiac(planetName, date) {
  const longs = planetLongitudes(date); // from ephemeris.js
  const deg = longs[planetName];
  return getZodiacFromLongitude(deg);
}

/**
 * Get the current active planetary hour
 * @param {Array} hours - Output of generatePlanetaryHours
 * @param {Date} now
 */
function getCurrentPlanetaryHour(hours, now = new Date()) {
  return hours.find(h => now >= h.start && now < h.end) || null;
}
