let data;
let simulatedData = null;
let trendActive = false;

const TOTAL_SEATS = 630;
const MAJORITY = 316;

const colorMap = {
  "SPD": "#e3000f",
  "CDU": "#151518",
  "CSU": "#0570C9",
  "Union": "#151518",
  "GRÜNE": "#409a3c",
  "FDP": "#ffed00",
  "AfD": "#00a2de",
  "Die Linke": "#be3075",
  "BSW": "#792351",
  "SSW": "#003366",
  "Volt": "#582c83"
};

async function loadMap() {

  const svg = await fetch("assets/btw25_wahlkreise_svg.svg")
      .then(r => r.text());

  document.getElementById("map").innerHTML = svg;

  data = await fetch("data/wahlkreise_2025.json")
      .then(r => r.json());

  assignWahlkreisIDs();
}

function assignWahlkreisIDs() {

  const paths = document.querySelectorAll("path");
  const tooltip = document.getElementById("tooltip");

  paths.forEach((path, index) => {

    const wkNr = (index + 1).toString();
    if (!data[wkNr]) return;

    path.style.fill = colorMap[data[wkNr].winner] || "#ccc";

    path.addEventListener("mousemove", (e) => {

      const values = trendActive && simulatedData
        ? simulatedData[wkNr]
        : data[wkNr].values;

      let html = `<strong>Wahlkreis ${wkNr}</strong><br><br>`;

      Object.entries(values)
        .sort((a,b) => b[1] - a[1])
        .forEach(([party, percent]) => {
          html += `${party}: ${percent.toFixed(2)}%<br>`;
        });

      tooltip.innerHTML = html;
      tooltip.style.left = e.pageX + 15 + "px";
      tooltip.style.top = e.pageY + 15 + "px";
      tooltip.style.display = "block";
    });

    path.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });
}

function applyCustomInput() {

  const nationalResult = {
    "CDU": parseFloat(CDU_input.value) || 0,
    "CSU": parseFloat(CSU_input.value) || 0,
    "AfD": parseFloat(AfD_input.value) || 0,
    "SPD": parseFloat(SPD_input.value) || 0,
    "GRÜNE": parseFloat(GRUENE_input.value) || 0,
    "Die Linke": parseFloat(LINKE_input.value) || 0,
    "FDP": parseFloat(FDP_input.value) || 0,
    "BSW": parseFloat(BSW_input.value) || 0
  };

  simulateMap(nationalResult);
  calculateSeats(nationalResult);

  trendActive = true;
}

function simulateMap(nationalResult) {

  simulatedData = {};
  const paths = document.querySelectorAll("path");

  paths.forEach((path, index) => {

    const wkNr = (index + 1).toString();
    if (!data[wkNr]) return;

    let values = {};
    Object.keys(data[wkNr].values).forEach(party => {
      values[party] = nationalResult[party] || 0;
    });

    simulatedData[wkNr] = values;

    let winner = Object.keys(values).reduce((a,b) =>
      values[a] > values[b] ? a : b
    );

    path.style.fill = colorMap[winner] || "#ccc";
  });
}

function calculateSeats(nationalResult) {

  let directMandates = {};

  document.querySelectorAll("path").forEach((path, index) => {

    const wkNr = (index + 1).toString();
    if (!data[wkNr]) return;

    const values = trendActive && simulatedData
      ? simulatedData[wkNr]
      : data[wkNr].values;

    let winner = Object.keys(values).reduce((a,b) =>
      values[a] > values[b] ? a : b
    );

    directMandates[winner] =
      (directMandates[winner] || 0) + 1;
  });

  let validParties = {};

  Object.keys(nationalResult).forEach(party => {

    if (
      nationalResult[party] >= 5 ||
      (directMandates[party] || 0) >= 3
    ) {
      validParties[party] = nationalResult[party];
    }
  });

  let totalPercent = Object.values(validParties)
    .reduce((a,b) => a + b, 0);

  Object.keys(validParties).forEach(party => {
    validParties[party] =
      validParties[party] / totalPercent;
  });

  let seats = {};

  Object.keys(validParties).forEach(party => {
    seats[party] =
      Math.round(validParties[party] * TOTAL_SEATS);
  });

  // 🔹 CDU + CSU → Union
  if (seats["CDU"] || seats["CSU"]) {
    seats["Union"] =
      (seats["CDU"] || 0) + (seats["CSU"] || 0);
    delete seats["CDU"];
    delete seats["CSU"];
  }

  displaySeatResult(seats);
  drawParliament(seats);
  buildCoalitionCalculator(seats);
}

function displaySeatResult(seats) {

  let html = "<h3>Sitzverteilung (630 Sitze)</h3>";

  Object.entries(seats)
    .sort((a,b) => b[1] - a[1])
    .forEach(([party, count]) => {

      html += `<div style="color:${colorMap[party] || "#999"}; font-weight:bold;">
                 ${party}: ${count} Sitze
               </div>`;
    });

  seatResult.innerHTML = html;
}

function drawParliament(seats) {

  const svg = document.getElementById("parliament");
  svg.innerHTML = "";

  const radius = 300;
  const centerX = 400;
  const centerY = 380;

  let seatArray = [];

  Object.entries(seats).forEach(([party, count]) => {
    for (let i = 0; i < count; i++) {
      seatArray.push(party);
    }
  });

  seatArray.forEach((party, index) => {

    const angle = Math.PI * (index / TOTAL_SEATS);
    const x = centerX + radius * Math.cos(Math.PI - angle);
    const y = centerY - radius * Math.sin(Math.PI - angle);

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 6);
    circle.setAttribute("fill", colorMap[party] || "#999");

    svg.appendChild(circle);
  });
}

function buildCoalitionCalculator(seats) {

  const container = document.getElementById("coalition");
  container.innerHTML = "";

  const parties = Object.keys(seats);
  let suggestions = [];

  function getSeatSum(combo) {
    return combo.reduce((sum, p) => sum + seats[p], 0);
  }

  for (let i = 0; i < parties.length; i++) {
    for (let j = i+1; j < parties.length; j++) {

      const combo = [parties[i], parties[j]];
      const total = getSeatSum(combo);

      if (total >= MAJORITY) {
        suggestions.push({ combo, total });
      }
    }
  }

  suggestions.sort((a,b) => a.total - b.total);

  let html = "<h4>Automatische Mehrheits-Koalitionen:</h4>";

  if (suggestions.length === 0) {
    html += "Keine Mehrheit möglich.";
  } else {
    suggestions.forEach(s => {
      html += `<div>
        ${s.combo.join(" + ")} → 
        <strong>${s.total} Sitze</strong>
      </div>`;
    });
  }

  container.innerHTML = html;
}

loadMap();
