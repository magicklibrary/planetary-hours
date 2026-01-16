// ======== app.js ========

// ---- DOM Containers ----
const hoursContainer = document.getElementById("hours");
const dayDisplay = document.getElementById("currentDay");
const view = document.getElementById("view");

// ---- Chaldean day rulers (Sunday=0) ----
const DAY_RULERS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

// ---- Save/load location (uses storage.js internally if present) ----
function saveLocation(lat, lon, city = "") {
  localStorage.setItem("location", JSON.stringify({ lat, lon, city }));
}

function loadLocation() {
  const loc = localStorage.getItem("location");
  if (!loc) return null;
  try {
    const data = JSON.parse(loc);
    if (data.lat != null && data.lon != null) {
      return { lat: parseFloat(data.lat), lon: parseFloat(data.lon), city: data.city || "" };
    }
  } catch (err) {
    console.error("Error parsing location:", err);
  }
  return null;
}

// ---- Mobile-friendly location ----
async function getLocation() {
  const saved = loadLocation();
  if (saved) return saved;

  // Try browser geolocation
  if (navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          saveLocation(lat, lon, "Current Location");
          resolve({ lat, lon, city: "Current Location" });
        },
        async () => {
          // Fallback to manual prompt
          await promptLocation();
          resolve(loadLocation());
        },
        { timeout: 10000 }
      );
    });
  } else {
    // Fallback if geolocation not available
    await promptLocation();
    return loadLocation();
  }
}

// ---- Prompt user for location (manual fallback) ----
async function promptLocation() {
  let input = prompt("Enter your city, state, and country (e.g., New York, NY, USA). Leave country blank for USA:");
  if (!input) return;

  // Assume USA if only city + state
  if (!input.includes(",")) input += ", USA";

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`,
      { headers: { "User-Agent": "PlanetaryHoursApp/1.0", "Accept": "application/json" } }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || data.length === 0) {
      alert("Location not found. Please try again.");
      return;
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    saveLocation(lat, lon, input);
    render();
  } catch (err) {
    console.error("Location fetch failed:", err);
    alert("Error retrieving location. Check your internet connection.");
  }
}

// ---- Render planetary hours ----
async function render() {
  hoursContainer.innerHTML = "";

  const location = await getLocation();
  if (!location) {
    dayDisplay.textContent = "No location set. Click 'Update Location'.";
    return;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayRuler = DAY_RULERS[today.getDay()];

  dayDisplay.textContent = `Day ruler: ${dayRuler} | Location: ${location.city || "Unknown"}`;

  // Get sunrise and sunset
  const sunTimes = getSunTimes(today, location.lat, location.lon);
  const hours = generatePlanetaryHours(dayRuler, sunTimes.sunrise, sunTimes.sunset);

  // Load natal chart
  let natal = null;
  try {
    const raw = localStorage.getItem("birthData");
    if (raw) natal = JSON.parse(raw);
  } catch (e) { console.warn("Invalid birthData:", e); }

  hours.forEach(h => {
    const div = document.createElement("div");
    div.className = "hour";

    // Highlight current hour
    if (now >= h.start && now < h.end) div.classList.add("active");

    div.style.borderColor = h.planet.color;

    const zodiac = getPlanetZodiac(h.planet.name, now);

    let natalMatch = false;
    if (natal && natal.date && natal.time) {
      const natalDate = new Date(`${natal.date}T${natal.time}`);
      const natalLongs = planetLongitudes(natalDate);
      const natalZodiac = getZodiacFromLongitude(natalLongs[h.planet.name]);
      natalMatch = natalZodiac.name === zodiac.name;
    }

    const dignity = getDignity(h.planet.name, zodiac.name);
    const strength = getHourStrength(h.planet.name, zodiac.name, natalMatch);

    div.innerHTML = `
      <strong style="color:${h.planet.color}">${h.planet.symbol} ${h.planet.name}</strong><br>
      ${h.start.toLocaleTimeString()} - ${h.end.toLocaleTimeString()}<br>
      <span class="zodiac">
        ${zodiac.symbol} ${zodiac.name}<br>
        Dignity: ${dignity}<br>
        Strength: ${strength}${natalMatch ? "<br>Resonant with natal chart" : ""}
      </span>
    `;

    hoursContainer.appendChild(div);
  });
}

// ---- Navigation buttons ----
function setupNavigation() {
  const navMap = {
    btnMain: "main.html",
    btnSettings: "settings.html",
    btnInstructions: "instructions.html",
    btnNatal: "natal.html",
    btnGuidance: "guidance.html",
    btnElectional: "electional.html",
    btnLegend: "legend.html"
  };

  Object.keys(navMap).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", () => { view.src = navMap[id]; });
  });

  const updateBtn = document.getElementById("updateLocationBtn");
  if (updateBtn) updateBtn.addEventListener("click", promptLocation);
}

// ---- Initialize ----
setupNavigation();
render();

// Only prompt user if no location is saved
if (!loadLocation()) setTimeout(promptLocation, 500);

// Refresh every minute
setInterval(render, 60000);
