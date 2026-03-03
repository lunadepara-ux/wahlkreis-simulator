let data;
let simulatedData = null;
let trendActive = false;

const TOTAL_SEATS = 630;
const DIRECT_SEATS = 299;
const LIST_SEATS = 331;

const colorMap = {
  "SPD": "#e3000f",
  "CDU": "#151518",
  "CSU": "#0570C9",
  "GRÜNE": "#409a3c",
  "FDP": "#ffed00",
  "AfD": "#00a2de",
  "Die Linke": "#be3075",
  "BSW": "#792351",
  "SSW": "#003366",
  "Volt": "#582c83"
};

const originalNational = {
  "CDU": 22.5,
  "CSU": 6.0,
  "AfD": 20.8,
  "SPD": 16.4,
  "GRÜNE": 13.9,
  "Die Linke": 8.6,
  "FDP": 4.3,
  "BSW": 5.0
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
    path.setAttribute("id", "WK_" + wkNr);

    if (!data[wkNr]) return;

    const winner = data[wkNr].winner;
    path.style.fill = colorMap[winner] || "#ccc";
    path.setAttribute("fill-opacity", "1");

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

function applyNationalTrend(newNational) {

  simulatedData = {};
  let swing = {};

  Object.keys(newNational).forEach(party => {
    swing[party] = newNational[party] - (originalNational[party] || 0);
  });

  const paths = document.querySelectorAll("path");

  paths.forEach((path, index) => {

    const wkNr = (index + 1).toString();
    if (!data[wkNr]) return;

    const original = data[wkNr].values;
    let simulated = {};

    Object.keys(original).forEach(party => {
      simulated[party] = original[party] + (swing[party] || 0);
    });

    simulatedData[wkNr] = simulated;

    let winner = Object.keys(simulated).reduce((a,b) =>
      simulated[a] > simulated[b] ? a : b
    );

    path.style.fill = colorMap[winner] || "#ccc";
    path.setAttribute("fill-opacity", "1");
  });
}

function toggleTrend() {

  const button = document.getElementById("trendButton");

  if (!trendActive) {

    applyNationalTrend(originalNational);

    trendActive = true;
    button.innerText = "Trend AUS";

  } else {

    const paths = document.querySelectorAll("path");

    paths.forEach((path, index) => {
      const wkNr = (index + 1).toString();
      if (!data[wkNr]) return;

      const winner = data[wkNr].winner;
      path.style.fill = colorMap[winner] || "#ccc";
    });

    trendActive = false;
    simulatedData = null;
    button.innerText = "Trend AN";
  }
}

function applyCustomInput() {

  const newNational = {
    "CDU": parseFloat(document.getElementById("CDU_input").value) || 0,
    "CSU": parseFloat(document.getElementById("CSU_input").value) || 0,
    "AfD": parseFloat(document.getElementById("AfD_input").value) || 0,
    "SPD": parseFloat(document.getElementById("SPD_input").value) || 0,
    "GRÜNE": parseFloat(document.getElementById("GRUENE_input").value) || 0,
    "Die Linke": parseFloat(document.getElementById("LINKE_input").value) || 0,
    "FDP": parseFloat(document.getElementById("FDP_input").value) || 0,
    "BSW": parseFloat(document.getElementById("BSW_input").value) || 0
  };

  applyNationalTrend(newNational);
  calculateSeats(newNational);

  trendActive = true;
  document.getElementById("trendButton").innerText = "Trend AUS";
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

    directMandates[winner] = (directMandates[winner] || 0) + 1;
  });

  // 5%-Hürde
  let validParties = {};
  Object.keys(nationalResult).forEach(party => {
    if (nationalResult[party] >= 5) {
      validParties[party] = nationalResult[party];
    }
  });

  let totalPercent = Object.values(validParties)
    .reduce((a,b) => a + b, 0);

  Object.keys(validParties).forEach(party => {
    validParties[party] = validParties[party] / totalPercent;
  });

  let seats = {};

  Object.keys(validParties).forEach(party => {
    seats[party] =
      Math.round(validParties[party] * LIST_SEATS);
  });

  Object.keys(directMandates).forEach(party => {
    seats[party] =
      (seats[party] || 0) + directMandates[party];
  });

  displaySeatResult(seats);
}

function displaySeatResult(seats) {

  let html = "<h3>Sitzverteilung (630 Sitze)</h3>";

  Object.entries(seats)
    .sort((a,b) => b[1] - a[1])
    .forEach(([party, seatCount]) => {

      const color = colorMap[party] || "#999";

      html += `<div style="color:${color}; font-weight:bold;">
                 ${party}: ${seatCount} Sitze
               </div>`;
    });

  document.getElementById("seatResult").innerHTML = html;
}

loadMap();