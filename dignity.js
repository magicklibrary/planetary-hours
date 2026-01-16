const PLANET_EXALTATIONS = {
  Sun: "Aries",
  Moon: "Taurus",
  Mercury: "Virgo",
  Venus: "Pisces",
  Mars: "Capricorn",
  Jupiter: "Cancer",
  Saturn: "Libra"
};

const PLANET_DETRIMENTS = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mercury: "Pisces",
  Venus: "Virgo",
  Mars: "Taurus",
  Jupiter: "Capricorn",
  Saturn: "Cancer"
};

const PLANET_FALLS = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mercury: "Pisces",
  Venus: "Virgo",
  Mars: "Cancer",
  Jupiter: "Capricorn",
  Saturn: "Aries"
};

function getDignity(planetName, zodiacName) {
  if (zodiacName === PLANET_EXALTATIONS[planetName]) return "Exaltation";
  if (zodiacName === PLANET_DETRIMENTS[planetName]) return "Detriment";
  if (zodiacName === PLANET_FALLS[planetName]) return "Fall";
  return "Rulership or Neutral";
}

function getHourStrength(planetName, zodiacName, natalMatch) {
  let score = 1; // base
  const dignity = getDignity(planetName, zodiacName);
  if (dignity === "Exaltation") score += 2;
  if (dignity === "Rulership or Neutral") score += 1;
  if (dignity === "Detriment") score -= 1;
  if (dignity === "Fall") score -= 2;
  if (natalMatch) score += 1; // resonance boost
  return score;
}
