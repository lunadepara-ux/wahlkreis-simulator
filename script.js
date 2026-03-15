let data;
let simulatedData = null;

const TOTAL_SEATS = 630;
const MAJORITY = 316;

const colorMap = {
  "Union": "#2c3548",
  "CDU": "#2c3548",
  "CSU": "#2c3548",
  "SPD": "#e3000f",
  "GRÜNE": "#409a3c",
  "FDP": "#ffed00",
  "AfD": "#00a2de",
  "Die Linke": "#be3075",
  "BSW": "#792351",
  "SSW": "#003366",
  "Volt": "#582c83",
  "FW": "#f08c00",
  "FREIE WÄHLER": "#f08c00"
};

const DEFAULTS_2025 = {
  "Union": 28.5,
  "AfD": 20.8,
  "SPD": 16.4,
  "GRÜNE": 13.9,
  "Die Linke": 8.6,
  "FDP": 4.3,
  "BSW": 5.0,
  "FW": 1.5,
  "Volt": 1.2,
  "SSW": 0.2
};

async function loadMap() {
  const svg = await fetch("assets/btw25_wahlkreise_svg.svg").then(r => r.text());
  document.getElementById("map").innerHTML = svg;

  data = await fetch("data/wahlkreise_2025.json").then(r => r.json());

  normalizeData();
  colorMapByErststimme();
  displaySeatResult({});
  drawParliament({});
  buildCoalitions({});
}

function normalizeData() {
  Object.keys(data).forEach(wkNr => {
    const wk = data[wkNr];

    if (!wk.erst && wk.values) wk.erst = { ...wk.values };
    if (!wk.zweit && wk.values) wk.zweit = { ...wk.values };

    if (!wk.erst) wk.erst = {};
    if (!wk.zweit) wk.zweit = {};

    // CDU/CSU lokal als Union behandeln
    wk.erst = mergeUnion(wk.erst);
    wk.zweit = mergeUnion(wk.zweit);
  });
}

function mergeUnion(values) {
  const copy = { ...values };

  let unionValue = 0;
  if (copy["CDU"] !== undefined) unionValue += copy["CDU"];
  if (copy["CSU"] !== undefined) unionValue += copy["CSU"];

  if (unionValue > 0) {
    copy["Union"] = unionValue;
    delete copy["CDU"];
    delete copy["CSU"];
  }

  if (copy["FREIE WÄHLER"] !== undefined) {
    copy["FW"] = copy["FREIE WÄHLER"];
    delete copy["FREIE WÄHLER"];
  }

  return copy;
}

function getWinner(values) {
  const entries = Object.entries(values);
  if (!entries.length) return null;
  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

function getNationalInput() {
  return {
    "Union": parseFloat(document.getElementById("UNION_input").value) || 0,
    "AfD": parseFloat(document.getElementById("AfD_input").value) || 0,
    "SPD": parseFloat(document.getElementById("SPD_input").value) || 0,
    "GRÜNE": parseFloat(document.getElementById("GRUENE_input").value) || 0,
    "Die Linke": parseFloat(document.getElementById("LINKE_input").value) || 0,
    "FDP": parseFloat(document.getElementById("FDP_input").value) || 0,
    "BSW": parseFloat(document.getElementById("BSW_input").value) || 0,
    "FW": parseFloat(document.getElementById("FW_input").value) || 0,
    "Volt": parseFloat(document.getElementById("Volt_input").value) || 0,
    "SSW": parseFloat(document.getElementById("SSW_input").value) || 0
  };
}

function getModifierConfig() {
  return {
    east: {
      party: document.getElementById("eastBoostParty").value,
      value: parseFloat(document.getElementById("eastBoostValue").value) || 0
    },
    west: {
      party: document.getElementById("westBoostParty").value,
      value: parseFloat(document.getElementById("westBoostValue").value) || 0
    },
    urban: {
      party: document.getElementById("urbanBoostParty").value,
      value: parseFloat(document.getElementById("urbanBoostValue").value) || 0
    },
    rural: {
      party: document.getElementById("ruralBoostParty").value,
      value: parseFloat(document.getElementById("ruralBoostValue").value) || 0
    }
  };
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

function classifyRegion(wkNr) {
  const n = parseInt(wkNr, 10);

  const eastSet = new Set([
    ...Array.from({ length: 6 }, (_, i) => 12 + i),   // grob Brandenburg/MV etc
    ...Array.from({ length: 18 }, (_, i) => 56 + i),
    ...Array.from({ length: 12 }, (_, i) => 74 + i)
  ]);

  const urbanSet = new Set([
    11,18,19,20,21,22,23,74,75,80,81,82,83,92,93,94
  ]);

  return {
    east: eastSet.has(n),
    west: !eastSet.has(n),
    urban: urbanSet.has(n),
    rural: !urbanSet.has(n)
  };
}

function simulateElection(nationalResult, modifiers) {
  simulatedData = {};

  const erstSwing = {};
  const zweitSwing = {};

  Object.keys(nationalResult).forEach(party => {
    erstSwing[party] = nationalResult[party] - getOriginalNationalAverage("erst", party);
    zweitSwing[party] = nationalResult[party] - getOriginalNationalAverage("zweit", party);
  });

  Object.keys(data).forEach(wkNr => {
    const original = data[wkNr];
    const region = classifyRegion(wkNr);

    const newErst = {};
    const newZweit = {};

    Object.keys(original.erst || {}).forEach(party => {
      let value = (original.erst[party] || 0) + (erstSwing[party] || 0);

      if (region.east && modifiers.east.party === party) value += modifiers.east.value;
      if (region.west && modifiers.west.party === party) value += modifiers.west.value;
      if (region.urban && modifiers.urban.party === party) value += modifiers.urban.value;
      if (region.rural && modifiers.rural.party === party) value += modifiers.rural.value;

      newErst[party] = Math.max(0, value);
    });

    Object.keys(original.zweit || {}).forEach(party => {
      let value = (original.zweit[party] || 0) + (zweitSwing[party] || 0);

      if (region.east && modifiers.east.party === party) value += modifiers.east.value;
      if (region.west && modifiers.west.party === party) value += modifiers.west.value;
      if (region.urban && modifiers.urban.party === party) value += modifiers.urban.value;
      if (region.rural && modifiers.rural.party === party) value += modifiers.rural.value;

      newZweit[party] = Math.max(0, value);
    });

    simulatedData[wkNr] = {
      name: original.name || `Wahlkreis ${wkNr}`,
      erst: newErst,
      zweit: newZweit
    };
  });

  return simulatedData;
}

function colorMapByErststimme(source = null) {
  const paths = document.querySelectorAll("path");
  const tooltip = document.getElementById("tooltip");

  paths.forEach((path, index) => {
    const wkNr = String(index + 1);
    const wk = source ? source[wkNr] : data[wkNr];
    if (!wk) return;

    const erst = wk.erst || {};
    const zweit = wk.zweit || {};
    const winner = getWinner(erst);

    path.style.fill = colorMap[winner] || "#ccc";
    path.setAttribute("fill-opacity", "1");

    path.onmousemove = (e) => {
      const current = source ? source[wkNr] : data[wkNr];
      const currentErst = current.erst || {};
      const currentZweit = current.zweit || {};

      let html = `<div class="tooltip-title">${current.name || `Wahlkreis ${wkNr}`}</div>`;

      html += `<div class="tooltip-block"><div class="tooltip-block-title">Erststimme</div>`;
      Object.entries(currentErst)
        .sort((a, b) => b[1] - a[1])
        .forEach(([party, val]) => {
          html += `<div class="tooltip-row"><span>${party}</span><strong>${val.toFixed(2)}%</strong></div>`;
        });
      html += `</div>`;

      html += `<div class="tooltip-block"><div class="tooltip-block-title">Zweitstimme</div>`;
      Object.entries(currentZweit)
        .sort((a, b) => b[1] - a[1])
        .forEach(([party, val]) => {
          html += `<div class="tooltip-row"><span>${party}</span><strong>${val.toFixed(2)}%</strong></div>`;
        });
      html += `</div>`;

      tooltip.innerHTML = html;
      tooltip.style.left = e.pageX + 16 + "px";
      tooltip.style.top = e.pageY + 16 + "px";
      tooltip.style.display = "block";
    };

    path.onmouseleave = () => {
      tooltip.style.display = "none";
    };
  });
}

function calculateSeatsFromSimulation(sim) {
  const directMandates = {};

  Object.keys(sim).forEach(wkNr => {
    const winner = getWinner(sim[wkNr].erst || {});
    if (!winner) return;
    directMandates[winner] = (directMandates[winner] || 0) + 1;
  });

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

  const validParties = {};
  Object.keys(zweitNational).forEach(party => {
    if (zweitNational[party] >= 5 || (directMandates[party] || 0) >= 3) {
      validParties[party] = zweitNational[party];
    }
  });

  const totalPercent = Object.values(validParties).reduce((a, b) => a + b, 0);
  Object.keys(validParties).forEach(party => {
    validParties[party] = validParties[party] / totalPercent;
  });

  const seats = {};
  Object.keys(validParties).forEach(party => {
    seats[party] = Math.round(validParties[party] * TOTAL_SEATS);
  });

  return { seats, directMandates, zweitNational };
}

function applyCustomInput() {
  const nationalResult = getNationalInput();
  const modifiers = getModifierConfig();

  const sim = simulateElection(nationalResult, modifiers);
  colorMapByErststimme(sim);

  const result = calculateSeatsFromSimulation(sim);
  displaySeatResult(result.seats, result.zweitNational, result.directMandates);
  drawParliament(result.seats);
  buildCoalitions(result.seats);
}

function displaySeatResult(seats, zweitNational, directMandates) {
  const seatResult = document.getElementById("seatResult");
  if (!seatResult) return;

  let html = `<div style="margin-bottom:12px;"><strong>Zweitstimme (simuliert)</strong></div>`;

  Object.entries(zweitNational || {})
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, val]) => {
      html += `<div class="seat-line"><span>${party}</span><span>${val.toFixed(2)}%</span></div>`;
    });

  html += `<div style="margin:14px 0 8px;"><strong>Sitzverteilung</strong></div>`;

  Object.entries(seats || {})
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, count]) => {
      const direct = directMandates?.[party] || 0;
      html += `<div class="seat-line" style="color:${colorMap[party] || "#999"};">
        <span>${party}</span>
        <span>${count} <span style="color:#9aa4b2;font-weight:400;">(${direct} Direkt)</span></span>
      </div>`;
    });

  seatResult.innerHTML = html;
}

function drawParliament(seats) {
  const svg = document.getElementById("parliament");
  if (!svg) return;
  svg.innerHTML = "";

  const radius = 300;
  const centerX = 400;
  const centerY = 380;

  let seatArray = [];
  Object.entries(seats || {}).forEach(([party, count]) => {
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

  container.innerHTML = "";
  const parties = Object.keys(seats || {});
  const combos = [];

  function sum(combo) {
    return combo.reduce((s, p) => s + seats[p], 0);
  }

  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const combo = [parties[i], parties[j]];
      const total = sum(combo);
      if (total >= MAJORITY) combos.push({ combo, total });
    }
  }

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
    container.innerHTML = `<div>Keine Mehrheit möglich.</div>`;
    return;
  }

  combos.forEach(entry => {
    container.innerHTML += `<div style="padding:6px 0;">
      ${entry.combo.join(" + ")} → <strong>${entry.total}</strong>
    </div>`;
  });
}

function resetInputs() {
  document.getElementById("UNION_input").value = DEFAULTS_2025.Union;
  document.getElementById("AfD_input").value = DEFAULTS_2025.AfD;
  document.getElementById("SPD_input").value = DEFAULTS_2025.SPD;
  document.getElementById("GRUENE_input").value = DEFAULTS_2025["GRÜNE"];
  document.getElementById("LINKE_input").value = DEFAULTS_2025["Die Linke"];
  document.getElementById("FDP_input").value = DEFAULTS_2025.FDP;
  document.getElementById("BSW_input").value = DEFAULTS_2025.BSW;
  document.getElementById("FW_input").value = DEFAULTS_2025.FW;
  document.getElementById("Volt_input").value = DEFAULTS_2025.Volt;
  document.getElementById("SSW_input").value = DEFAULTS_2025.SSW;

  document.getElementById("eastBoostParty").value = "AfD";
  document.getElementById("eastBoostValue").value = "2.0";
  document.getElementById("westBoostParty").value = "Union";
  document.getElementById("westBoostValue").value = "1.0";
  document.getElementById("urbanBoostParty").value = "GRÜNE";
  document.getElementById("urbanBoostValue").value = "2.0";
  document.getElementById("ruralBoostParty").value = "Union";
  document.getElementById("ruralBoostValue").value = "1.5";

  colorMapByErststimme();
  displaySeatResult({}, {}, {});
  drawParliament({});
  buildCoalitions({});
}

loadMap();
