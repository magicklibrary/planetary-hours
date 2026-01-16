// ======== Main containers ========
const hoursContainer = document.getElementById("hours");
const dayDisplay = document.getElementById("currentDay");
const view = document.getElementById("view");

// ======== Local Storage ========
function saveLocation(lat, lon, cityName = "") {
  localStorage.setItem("location", JSON.stringify({ lat, lon, city: cityName }));
}

function loadLocation() {
  const loc = localStorage.getItem("location");
  return loc ? JSON.parse(loc) : null;
}

// ======== Prompt user for location ========
async function promptLocation() {
  let input = prompt("Enter your city, state, and country (e.g., New York, NY, USA):");
  if (!input) return;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      saveLocation(lat, lon, input); // store city too
      render();
    } else {
      alert("Could not find location. Please try again.");
    }
  } catch (err) {
    console.error(err);
    alert("Error retrieving location. Check your internet connection.");
  }
}

// ======== Render planetary hours ========
function render() {
  hoursContainer.innerHTML = "";

  const location = loadLocation();
  if (!location) {
    dayDisplay.textContent = "No location set";
    return;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayRuler = DAY_RULERS[today.getDay()];

  dayDisplay.textContent = `Day ruler: ${dayRuler} | Location: ${location.city || "Unknown"}`;

  // Sunrise/sunset and planetary hours
  const sunTimes = getSunTimes(today, location.lat, location.lon);
  const hours = generatePlanetaryHours(dayRuler, sunTimes.sunrise, sunTimes.sunset);

  // Load natal data
  const natalRaw = localStorage.getItem("birthData");
  let natal = natalRaw ? JSON.parse(natalRaw) : null;

  hours.forEach(h => {
    const div = document.createElement("div");
    div.className = "hour";

    // Highlight current hour
    if (now >= h.start && now < h.end) div.classList.add("active");

    div.style.borderColor = h.planet.color;

    // Zodiac for the planet
    const zodiac = getPlanetZodiac(h.planet.name, now);

    // Natal resonance
    let natalMatch = false;
    if (natal) {
      const natalDate = new Date(`${natal.date}T${natal.time}`);
      const natalLongs = planetLongitudes(natalDate);
      const natalZodiac = getZodiacFromLongitude(natalLongs[h.planet.name]);
      natalMatch = natalZodiac.name === zodiac.name;
    }

    // Dignity and strength
    const dignity = getDignity(h.planet.name, zodiac.name);
    const strength = getHourStrength(h.planet.name, zodiac.name, natalMatch);

    // Render HTML
    div.innerHTML = `
      <strong style="color:${h.planet.color}">${h.planet.symbol} ${h.planet.name}</strong><br>
      ${h.start.toLocaleTimeString()} to ${h.end.toLocaleTimeString()}
      <div class="zodiac">
        ${zodiac.symbol} ${zodiac.name}<br>
        Dignity: ${dignity}<br>
        Strength: ${strength}<br>
        ${natalMatch ? "<div>Resonant with natal chart</div>" : ""}
      </div>
    `;

    hoursContainer.appendChild(div);
  });

  // Update current planetary energy display
  const currentHour = hours.find(h => now >= h.start && now < h.end);
  if (currentHour) {
    document.getElementById("currentPlanetSymbol").textContent = currentHour.planet.symbol;
    document.getElementById("currentPlanetSymbol").style.color = currentHour.planet.color;
    document.getElementById("currentPlanetName").textContent = currentHour.planet.name;
  } else {
    document.getElementById("currentPlanetSymbol").textContent = "-";
    document.getElementById("currentPlanetName").textContent = "-";
  }
}

// ======== Navigation buttons ========
document.getElementById("btnMain").addEventListener("click", () => { view.src = "main.html"; });
document.getElementById("btnSettings").addEventListener("click", () => { view.src = "settings.html"; });
document.getElementById("btnInstructions").addEventListener("click", () => { view.src = "instructions.html"; });
document.getElementById("btnNatal").addEventListener("click", () => { view.src = "natal.html"; });
document.getElementById("btnGuidance").addEventListener("click", () => { view.src = "guidance.html"; });
document.getElementById("btnElectional").addEventListener("click", () => { view.src = "electional.html"; });
document.getElementById("btnLegend").addEventListener("click", () => { view.src = "legend.html"; });
document.getElementById("updateLocationBtn").addEventListener("click", promptLocation);

// ======== Initial load ========
if (!loadLocation()) {
  promptLocation();
} else {
  render();
}

// Refresh every minute
setInterval(render, 60000);
