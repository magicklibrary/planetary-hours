// zodiac.js

// Zodiac signs with start longitude (0° = 0 Aries)
const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", start: 0 },
  { name: "Taurus", symbol: "♉", start: 30 },
  { name: "Gemini", symbol: "♊", start: 60 },
  { name: "Cancer", symbol: "♋", start: 90 },
  { name: "Leo", symbol: "♌", start: 120 },
  { name: "Virgo", symbol: "♍", start: 150 },
  { name: "Libra", symbol: "♎", start: 180 },
  { name: "Scorpio", symbol: "♏", start: 210 },
  { name: "Sagittarius", symbol: "♐", start: 240 },
  { name: "Capricorn", symbol: "♑", start: 270 },
  { name: "Aquarius", symbol: "♒", start: 300 },
  { name: "Pisces", symbol: "♓", start: 330 }
];

/**
 * Normalize degrees to 0–360
 * @param {number} deg
 * @returns {number}
 */
function normalizeDegrees(deg) {
  return (deg % 360 + 360) % 360;
}

/**
 * Get zodiac sign from a planet's ecliptic longitude
 * @param {number} deg - longitude in degrees
 * @returns {{name: string, symbol: string}}
 */
function getZodiacFromLongitude(deg) {
  const longitude = normalizeDegrees(deg);
  // iterate from last to first to correctly handle 0–360 wrap
  for (let i = ZODIAC_SIGNS.length - 1; i >= 0; i--) {
    if (longitude >= ZODIAC_SIGNS[i].start) {
      return { name: ZODIAC_SIGNS[i].name, symbol: ZODIAC_SIGNS[i].symbol };
    }
  }
  // fallback (should never happen)
  return { name: "Aries", symbol: "♈" };
}
