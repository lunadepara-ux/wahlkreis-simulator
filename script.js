let data;
let simulatedData = null;

const TOTAL_SEATS = 630;
const MAJORITY = 316;

const colorMap = {
  "Union": "#151518",
  "CDU": "#151518",
  "CSU": "#0570C9",
  "SPD": "#e3000f",
  "GRÜNE": "#409a3c",
  "FDP": "#ffed00",
  "AfD": "#00a2de",
  "Die Linke": "#be3075",
  "BSW": "#792351",
  "SSW": "#003366",
  "Volt": "#582c83"
};

// Parteien, die im UI eingegeben werden
const INPUT_PARTIES = [
  "CDU", "CSU", "AfD", "SPD", "GRÜNE", "Die Linke", "FDP", "BSW"
];

async function loadMap() {
  const svg = await fetch("assets/btw25_wahlkreise_svg.svg").then(r => r.text());
  document.getElementById("map").innerHTML = svg;

  data = await fetch("data/wahlkreise_2025.json").then(r => r.json());

  normalizeData();
  colorMapByErststimme();
  ensureProjectionUI();
}

function normalizeData() {
  // Fallback für alte Struktur:
  // { winner, values } -> { erst: values, zweit: values }
  Object.keys(data).forEach(wkNr => {
    const wk = data[wkNr];

    if (!wk.erst && wk.values) {
      wk.erst = { ...wk.values };
    }
    if (!wk.zweit && wk.values) {
      wk.zweit = { ...wk.values };
    }

    if (!wk.erst) wk.erst = {};
    if (!wk.zweit) wk.zweit = {};
  });
}

function getOriginalNationalAverage(voteType, party) {
  let total = 0;
  let count = 0;

  Object.values(data).forEach(wk => {
    if (wk[voteType] && wk[voteType][party] !== undefined) {
      total += wk[voteType][party];
      count++;
    }
  });

  return count ? total / count : 0;
}

function getWinner(values) {
  const entries = Object.entries(values);
  if (!entries.length) return null;
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

function colorMapByErststimme(source = null) {
  const paths = document.querySelectorAll("path");
  const tooltip = document.getElementById("tooltip");

  paths.forEach((path, index) => {
    const wkNr = String(index + 1);
    const wk = source ? source[wkNr] : data[wkNr];
    if (!wk) return;

    const erst = wk.erst || {};
    const winner = getWinner(erst);
    path.style.fill = colorMap[winner] || "#ccc";
    path.setAttribute("fill-opacity", "1");

    path.onmousemove = (e) => {
      const displayWK = source ? source[wkNr] : data[wkNr];
      if (!displayWK) return;

      const erstValues = displayWK.erst || {};
      const zweitValues = displayWK.zweit || {};

      let html = `<strong>Wahlkreis ${wkNr}</strong><br><br><u>Erststimme</u><br>`;

      Object.entries(erstValues)
        .sort((a, b) => b[1] - a[1])
        .forEach(([party, val]) => {
          html += `${party}: ${val.toFixed(2)}%<br>`;
        });

      html += `<br><u>Zweitstimme</u><br>`;

      Object.entries(zweitValues)
        .sort((a, b) => b[1] - a[1])
        .forEach(([party, val]) => {
          html += `${party}: ${val.toFixed(2)}%<br>`;
        });

      tooltip.innerHTML = html;
      tooltip.style.left = e.pageX + 15 + "px";
      tooltip.style.top = e.pageY + 15 + "px";
      tooltip.style.display = "block";
    };

    path.onmouseleave = () => {
      tooltip.style.display = "none";
    };
  });
}

function getNationalInput() {
  return {
    "CDU": parseFloat(document.getElementById("CDU_input")?.value) || 0,
    "CSU": parseFloat(document.getElementById("CSU_input")?.value) || 0,
    "AfD": parseFloat(document.getElementById("AfD_input")?.value) || 0,
    "SPD": parseFloat(document.getElementById("SPD_input")?.value) || 0,
    "GRÜNE": parseFloat(document.getElementById("GRUENE_input")?.value) || 0,
    "Die Linke": parseFloat(document.getElementById("LINKE_input")?.value) || 0,
    "FDP": parseFloat(document.getElementById("FDP_input")?.value) || 0,
    "BSW": parseFloat(document.getElementById("BSW_input")?.value) || 0
  };
}

function simulateElection(zweitNational, reportingPercent = 100) {
  // Swing auf Erst- und Zweitstimme getrennt anwenden
  const erstSwing = {};
  const zweitSwing = {};

  INPUT_PARTIES.forEach(party => {
    erstSwing[party] = zweitNational[party] - getOriginalNationalAverage("erst", party);
    zweitSwing[party] = zweitNational[party] - getOriginalNationalAverage("zweit", party);
  });

  const simulated = {};

  Object.keys(data).forEach(wkNr => {
    const original = data[wkNr];
    const reported = shouldReportWK(wkNr, reportingPercent);

    const newErst = {};
    const newZweit = {};

    Object.keys(original.erst || {}).forEach(party => {
      newErst[party] = Math.max(0, (original.erst[party] || 0) + (erstSwing[party] || 0));
    });

    Object.keys(original.zweit || {}).forEach(party => {
      newZweit[party] = Math.max(0, (original.zweit[party] || 0) + (zweitSwing[party] || 0));
    });

    simulated[wkNr] = {
      reported,
      erst: reported ? newErst : newErst,
      zweit: reported ? newZweit : newZweit
    };
  });

  return simulated;
}

function shouldReportWK(wkNr, reportingPercent) {
  const wk = parseInt(wkNr, 10);
  const threshold = Math.floor((299 * reportingPercent) / 100);
  return wk <= threshold;
}

function calculateSeatsFromSimulation(sim) {
  const directMandates = {};

  // Direktmandate aus Erststimme
  Object.keys(sim).forEach(wkNr => {
    const winner = getWinner(sim[wkNr].erst || {});
    if (!winner) return;
    directMandates[winner] = (directMandates[winner] || 0) + 1;
  });

  // nationale Zweitstimme aus allen Wahlkreisen mitteln
  const zweitNational = {};
  const countPerParty = {};

  Object.values(sim).forEach(wk => {
    Object.entries(wk.zweit || {}).forEach(([party, val]) => {
      zweitNational[party] = (zweitNational[party] || 0) + val;
      countPerParty[party] = (countPerParty[party] || 0) + 1;
    });
  });

  Object.keys(zweitNational).forEach(party => {
    zweitNational[party] = zweitNational[party] / countPerParty[party];
  });

  // 5%-Hürde oder 3 Direktmandate
  const validParties = {};
  Object.keys(zweitNational).forEach(party => {
    if (zweitNational[party] >= 5 || (directMandates[party] || 0) >= 3) {
      validParties[party] = zweitNational[party];
    }
  });

  // Normieren
  const totalPercent = Object.values(validParties).reduce((a, b) => a + b, 0);
  Object.keys(validParties).forEach(party => {
    validParties[party] = validParties[party] / totalPercent;
  });

  // Sitze proportional
  let seats = {};
  Object.keys(validParties).forEach(party => {
    seats[party] = Math.round(validParties[party] * TOTAL_SEATS);
  });

  // Union zusammenlegen
  if (seats["CDU"] || seats["CSU"]) {
    seats["Union"] = (seats["CDU"] || 0) + (seats["CSU"] || 0);
    delete seats["CDU"];
    delete seats["CSU"];
  }

  return { seats, directMandates, zweitNational };
}

function applyCustomInput() {
  const zweitNational = getNationalInput();
  const reportingPercent = parseInt(document.getElementById("reporting_input")?.value || "100", 10);

  simulatedData = simulateElection(zweitNational, reportingPercent);

  colorMapByErststimme(simulatedData);

  const result = calculateSeatsFromSimulation(simulatedData);
  displaySeatResult(result.seats, result.zweitNational, reportingPercent);
  drawParliament(result.seats);
  buildCoalitions(result.seats);
}

function displaySeatResult(seats, zweitNational, reportingPercent) {
  let html = `<h3>Prognose / Hochrechnung</h3>`;
  html += `<div><strong>Meldestand:</strong> ${reportingPercent}%</div><br>`;

  html += `<div><strong>Zweitstimme (bundesweit, simuliert)</strong></div>`;
  Object.entries(zweitNational)
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, val]) => {
      const label = party === "CDU" || party === "CSU" ? party : party;
      html += `<div>${label}: ${val.toFixed(2)}%</div>`;
    });

  html += `<br><div><strong>Sitzverteilung (630 Sitze)</strong></div>`;
  Object.entries(seats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, count]) => {
      html += `<div style="color:${colorMap[party] || "#999"}; font-weight:bold;">
        ${party}: ${count} Sitze
      </div>`;
    });

  document.getElementById("seatResult").innerHTML = html;
}

function drawParliament(seats) {
  const svg = document.getElementById("parliament");
  if (!svg) return;
  svg.innerHTML = "";

  const radius = 300;
  const centerX = 400;
  const centerY = 380;

  let seatArray = [];
  Object.entries(seats).forEach(([party, count]) => {
    for (let i = 0; i < count; i++) seatArray.push(party);
  });

  seatArray = seatArray.slice(0, TOTAL_SEATS);

  seatArray.forEach((party, index) => {
    const angle = Math.PI * (index / TOTAL_SEATS);
    const x = centerX + radius * Math.cos(Math.PI - angle);
    const y = centerY - radius * Math.sin(Math.PI - angle);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 6);
    circle.setAttribute("fill", colorMap[party] || "#999");

    svg.appendChild(circle);
  });
}

function buildCoalitions(seats) {
  const container = document.getElementById("coalition");
  if (!container) return;

  container.innerHTML = "<h4>Automatische Mehrheits-Koalitionen</h4>";
  const parties = Object.keys(seats);
  const combos = [];

  function sum(combo) {
    return combo.reduce((s, p) => s + seats[p], 0);
  }

  // 2er
  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const combo = [parties[i], parties[j]];
      const total = sum(combo);
      if (total >= MAJORITY) combos.push({ combo, total });
    }
  }

  // 3er
  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      for (let k = j + 1; k < parties.length; k++) {
        const combo = [parties[i], parties[j], parties[k]];
        const total = sum(combo);
        if (total >= MAJORITY) combos.push({ combo, total });
      }
    }
  }

  combos.sort((a, b) => a.total - b.total);

  if (!combos.length) {
    container.innerHTML += "<div>Keine Mehrheit möglich.</div>";
    return;
  }

  combos.forEach(entry => {
    container.innerHTML += `<div>${entry.combo.join(" + ")} → <strong>${entry.total}</strong></div>`;
  });
}

function ensureProjectionUI() {
  const container = document.getElementById("inputContainer");
  if (!container || document.getElementById("reporting_input")) return;

  const block = document.createElement("div");
  block.style.marginTop = "12px";
  block.innerHTML = `
    Meldestand % <input type="number" id="reporting_input" min="0" max="100" value="100" step="1"><br><br>
  `;

  container.appendChild(block);
}

loadMap();
