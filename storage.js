// storage.js - handles location and natal data

/**
 * Save location with optional city name
 * @param {number} lat 
 * @param {number} lon 
 * @param {string} cityName
 */
function saveLocation(lat, lon, cityName = "") {
  localStorage.setItem("location", JSON.stringify({ lat, lon, city: cityName }));
}

/**
 * Load location
 * @returns {{lat: number, lon: number, city: string}|null}
 */
function loadLocation() {
  const loc = localStorage.getItem("location");
  if (!loc) return null;

  try {
    const data = JSON.parse(loc);
    if (data.lat != null && data.lon != null) {
      return { lat: parseFloat(data.lat), lon: parseFloat(data.lon), city: data.city || "" };
    }
  } catch (err) {
    console.error("Error parsing location from localStorage:", err);
  }

  return null;
}

/**
 * Save natal/birth data
 * @param {string} date - YYYY-MM-DD
 * @param {string} time - HH:MM (24-hour)
 */
function saveNatal(date, time) {
  localStorage.setItem("birthData", JSON.stringify({ date, time }));
}

/**
 * Load natal/birth data
 * @returns {{date: string, time: string}|null}
 */
function loadNatal() {
  const raw = localStorage.getItem("birthData");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error parsing natal data:", err);
    return null;
  }
}
