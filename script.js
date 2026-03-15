let data;
let simulatedData = null;

const TOTAL_SEATS = 630;
const MAJORITY = 316;

const colorMap = {
  "Union": "#3a455c",
  "CDU": "#3a455c",
  "CSU": "#3a455c",
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

const logoMap = {
  "Union": "assets/logos/Union.png",
  "AfD": "assets/logos/AfD.png",
  "SPD": "assets/logos/SPD.png",
  "GRÜNE": "assets/logos/Gruene.png",
  "Die Linke": "assets/logos/Linke.png",
  "FDP": "assets/logos/FDP.png",
  "BSW": "assets/logos/BSW.png",
  "FW": "assets/logos/fw.png",
  "Volt": "assets/logos/Volt.png",
  "SSW": "assets/logos/ssw.png"
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

const coalitionLabels = {
  "SPD + Union": "GroKo",
  "Union + AfD": "Schwarz-Blau",
  "SPD + GRÜNE + Die Linke": "Rot-Rot-Grün",
  "SPD + FDP + GRÜNE": "Ampel",
  "Union + FDP + GRÜNE": "Jamaika",
  "Union + SPD + GRÜNE": "Kenya",
  "Union + SPD + FDP": "Deutschland"
};

const translations = {
  de: {
    appSubtitle: "Wahlkreise, Prognosen, Sitzverteilung und Koalitionen.",
    metaTitle: "Projekt",
    languageLabel: "Sprache",
    countryLabel: "Land",
    inputTitle: "Bundeswerte eingeben",
    inputSubtitle: "Zweitstimmen-Prognose für die Sitzverteilung und regionale Simulation.",
    regionalTitle: "Regionale Verstärkung",
    eastPartyLabel: "Osten stärkt",
    eastValueLabel: "Ost +%",
    westPartyLabel: "Westen stärkt",
    westValueLabel: "West +%",
    urbanPartyLabel: "Stadt stärkt",
    urbanValueLabel: "Stadt +%",
    ruralPartyLabel: "Land stärkt",
    ruralValueLabel: "Land +%",
    calcButton: "Berechnen",
    resetButton: "Reset 2025",
    inputNote: "Karte = Erststimme. Sitzverteilung = Zweitstimme. Grundmandatsklausel aktiv. Union wird als eine Fraktion behandelt.",
    legendTitle: "Legende",
    mainTitle: "Bundestagswahl 2025",
    mainSubtitle: "Wahlkreis-Karte, Sitzprojektion und automatische Koalitionsvorschläge.",
    mapTitle: "Wahlkreiskarte",
    mapSubtitle: "Färbung nach Erststimme. Hover zeigt Erst- und Zweitstimme.",
    seatsTitle: "Sitzverteilung",
    seatsSubtitle: "630 Sitze, Union zusammengelegt.",
    parliamentTitle: "Bundestag",
    parliamentSubtitle: "Halbkreis-Visualisierung der Sitze.",
    coalitionTitle: "Koalitionsrechner",
    coalitionSubtitle: "Automatische Mehrheitsoptionen ab 316 Sitzen.",
    firstVote: "Erststimme",
    secondVote: "Zweitstimme",
    simulatedSecondVote: "Zweitstimme (simuliert)",
    seatDistribution: "Sitzverteilung",
    direct: "Direkt",
    noMajority: "Keine Mehrheit möglich."
  },
  en: {
    appSubtitle: "Constituencies, projections, seat distribution and coalitions.",
    metaTitle: "Project",
    languageLabel: "Language",
    countryLabel: "Country",
    inputTitle: "Enter national values",
    inputSubtitle: "Second-vote projection for seat distribution and regional simulation.",
    regionalTitle: "Regional boost",
    eastPartyLabel: "East boosts",
    eastValueLabel: "East +%",
    westPartyLabel: "West boosts",
    westValueLabel: "West +%",
    urbanPartyLabel: "Urban boosts",
    urbanValueLabel: "Urban +%",
    ruralPartyLabel: "Rural boosts",
    ruralValueLabel: "Rural +%",
    calcButton: "Calculate",
    resetButton: "Reset 2025",
    inputNote: "Map = first vote. Seats = second vote. Basic mandate clause active. Union is treated as one bloc.",
    legendTitle: "Legend",
    mainTitle: "German federal election 2025",
    mainSubtitle: "Constituency map, seat projection and automatic coalition suggestions.",
    mapTitle: "Constituency map",
    mapSubtitle: "Coloring by first vote. Hover shows first and second vote.",
    seatsTitle: "Seat distribution",
    seatsSubtitle: "630 seats, Union merged.",
    parliamentTitle: "Parliament",
    parliamentSubtitle: "Semicircle seat visualization.",
    coalitionTitle: "Coalition calculator",
    coalitionSubtitle: "Automatic majority options from 316 seats.",
    firstVote: "First vote",
    secondVote: "Second vote",
    simulatedSecondVote: "Second vote (simulated)",
    seatDistribution: "Seat distribution",
    direct: "Direct",
    noMajority: "No majority possible."
  },
  pl: {
    appSubtitle: "Okręgi, prognozy, podział mandatów i koalicje.",
    metaTitle: "Projekt",
    languageLabel: "Język",
    countryLabel: "Kraj",
    inputTitle: "Wprowadź wyniki krajowe",
    inputSubtitle: "Prognoza drugiego głosu dla podziału mandatów i symulacji regionalnej.",
    regionalTitle: "Wzmocnienie regionalne",
    eastPartyLabel: "Wschód wzmacnia",
    eastValueLabel: "Wschód +%",
    westPartyLabel: "Zachód wzmacnia",
    westValueLabel: "Zachód +%",
    urbanPartyLabel: "Miasto wzmacnia",
    urbanValueLabel: "Miasto +%",
    ruralPartyLabel: "Wieś wzmacnia",
    ruralValueLabel: "Wieś +%",
    calcButton: "Oblicz",
    resetButton: "Reset 2025",
    inputNote: "Mapa = pierwszy głos. Mandaty = drugi głos. Klauzula mandatów podstawowych aktywna. Union liczona jako jeden blok.",
    legendTitle: "Legenda",
    mainTitle: "Wybory do Bundestagu 2025",
    mainSubtitle: "Mapa okręgów, projekcja mandatów i automatyczne propozycje koalicji.",
    mapTitle: "Mapa okręgów",
    mapSubtitle: "Kolory według pierwszego głosu. Po najechaniu widać pierwszy i drugi głos.",
    seatsTitle: "Podział mandatów",
    seatsSubtitle: "630 mandatów, Union połączona.",
    parliamentTitle: "Bundestag",
    parliamentSubtitle: "Półokrągła wizualizacja mandatów.",
    coalitionTitle: "Kalkulator koalicji",
    coalitionSubtitle: "Automatyczne większości od 316 mandatów.",
    firstVote: "Pierwszy głos",
    secondVote: "Drugi głos",
    simulatedSecondVote: "Drugi głos (symulacja)",
    seatDistribution: "Podział mandatów",
    direct: "Bezpośrednie",
    noMajority: "Brak możliwej większości."
  },
  fr: {
    appSubtitle: "Circonscriptions, projections, répartition des sièges et coalitions.",
    metaTitle: "Projet",
    languageLabel: "Langue",
    countryLabel: "Pays",
    inputTitle: "Entrer les valeurs nationales",
    inputSubtitle: "Projection du second vote pour la répartition des sièges et la simulation régionale.",
    regionalTitle: "Renforcement régional",
    eastPartyLabel: "L’Est favorise",
    eastValueLabel: "Est +%",
    westPartyLabel: "L’Ouest favorise",
    westValueLabel: "Ouest +%",
    urbanPartyLabel: "Ville favorise",
    urbanValueLabel: "Ville +%",
    ruralPartyLabel: "Campagne favorise",
    ruralValueLabel: "Campagne +%",
    calcButton: "Calculer",
    resetButton: "Réinitialiser 2025",
    inputNote: "Carte = premier vote. Sièges = second vote. Clause des mandats de base active. L’Union est traitée comme un seul bloc.",
    legendTitle: "Légende",
    mainTitle: "Élections fédérales 2025",
    mainSubtitle: "Carte des circonscriptions, projection des sièges et coalitions automatiques.",
    mapTitle: "Carte des circonscriptions",
    mapSubtitle: "Couleurs selon le premier vote. Au survol, premier et second vote.",
    seatsTitle: "Répartition des sièges",
    seatsSubtitle: "630 sièges, Union fusionnée.",
    parliamentTitle: "Bundestag",
    parliamentSubtitle: "Visualisation en demi-cercle des sièges.",
    coalitionTitle: "Calculateur de coalition",
    coalitionSubtitle: "Options de majorité automatiques à partir de 316 sièges.",
    firstVote: "Premier vote",
    secondVote: "Second vote",
    simulatedSecondVote: "Second vote (simulé)",
    seatDistribution: "Répartition des sièges",
    direct: "Directs",
    noMajority: "Aucune majorité possible."
  },
  es: {
    appSubtitle: "Distritos, proyecciones, reparto de escaños y coaliciones.",
    metaTitle: "Proyecto",
    languageLabel: "Idioma",
    countryLabel: "País",
    inputTitle: "Introducir valores nacionales",
    inputSubtitle: "Proyección del segundo voto para el reparto de escaños y la simulación regional.",
    regionalTitle: "Refuerzo regional",
    eastPartyLabel: "Este favorece",
    eastValueLabel: "Este +%",
    westPartyLabel: "Oeste favorece",
    westValueLabel: "Oeste +%",
    urbanPartyLabel: "Ciudad favorece",
    urbanValueLabel: "Ciudad +%",
    ruralPartyLabel: "Campo favorece",
    ruralValueLabel: "Campo +%",
    calcButton: "Calcular",
    resetButton: "Reset 2025",
    inputNote: "Mapa = primer voto. Escaños = segundo voto. Cláusula de mandatos básicos activa. La Unión se trata como un solo bloque.",
    legendTitle: "Leyenda",
    mainTitle: "Elección federal 2025",
    mainSubtitle: "Mapa de distritos, proyección de escaños y coaliciones automáticas.",
    mapTitle: "Mapa de distritos",
    mapSubtitle: "Colores según el primer voto. Al pasar el ratón se ve primer y segundo voto.",
    seatsTitle: "Reparto de escaños",
    seatsSubtitle: "630 escaños, Unión unificada.",
    parliamentTitle: "Bundestag",
    parliamentSubtitle: "Visualización semicircular de los escaños.",
    coalitionTitle: "Calculadora de coaliciones",
    coalitionSubtitle: "Opciones automáticas de mayoría a partir de 316 escaños.",
    firstVote: "Primer voto",
    secondVote: "Segundo voto",
    simulatedSecondVote: "Segundo voto (simulado)",
    seatDistribution: "Reparto de escaños",
    direct: "Directos",
    noMajority: "No hay mayoría posible."
  }
};

let currentLang = "de";

const DEFAULT_FIELDS = {
  eastBoostParty: "AfD",
  eastBoostValue: "2.0",
  westBoostParty: "Union",
  westBoostValue: "1.0",
  urbanBoostParty: "GRÜNE",
  urbanBoostValue: "2.0",
  ruralBoostParty: "Union",
  ruralBoostValue: "1.5"
};

async function loadMap() {
  const svg = await fetch("assets/btw25_wahlkreise_svg.svg").then(r => r.text());
  document.getElementById("map").innerHTML = svg;

  data = await fetch("data/wahlkreise_2025.json").then(r => r.json());

  normalizeData();
  wireLanguageSelector();
  applyLanguage(currentLang);
  colorMapByErststimme();
  displaySeatResult({}, {}, {});
  drawParliament({});
  buildCoalitions({});
}

function wireLanguageSelector() {
  const select = document.getElementById("languageSelect");
  select.addEventListener("change", () => {
    currentLang = select.value;
    applyLanguage(currentLang);
    if (simulatedData) {
      const result = calculateSeatsFromSimulation(simulatedData);
      displaySeatResult(result.seats, result.zweitNational, result.directMandates);
      buildCoalitions(result.seats);
    }
  });
}

function t(key) {
  return translations[currentLang]?.[key] || translations.de[key] || key;
}

function applyLanguage(lang) {
  currentLang = lang;
  setText("appSubtitle", t("appSubtitle"));
  setText("metaTitle", t("metaTitle"));
  setText("languageLabel", t("languageLabel"));
  setText("countryLabel", t("countryLabel"));
  setText("inputTitle", t("inputTitle"));
  setText("inputSubtitle", t("inputSubtitle"));
  setText("regionalTitle", t("regionalTitle"));
  setText("eastPartyLabel", t("eastPartyLabel"));
  setText("eastValueLabel", t("eastValueLabel"));
  setText("westPartyLabel", t("westPartyLabel"));
  setText("westValueLabel", t("westValueLabel"));
  setText("urbanPartyLabel", t("urbanPartyLabel"));
  setText("urbanValueLabel", t("urbanValueLabel"));
  setText("ruralPartyLabel", t("ruralPartyLabel"));
  setText("ruralValueLabel", t("ruralValueLabel"));
  setText("calcButton", t("calcButton"));
  setText("resetButton", t("resetButton"));
  setText("inputNote", t("inputNote"));
  setText("legendTitle", t("legendTitle"));
  setText("mainTitle", t("mainTitle"));
  setText("mainSubtitle", t("mainSubtitle"));
  setText("mapTitle", t("mapTitle"));
  setText("mapSubtitle", t("mapSubtitle"));
  setText("seatsTitle", t("seatsTitle"));
  setText("seatsSubtitle", t("seatsSubtitle"));
  setText("parliamentTitle", t("parliamentTitle"));
  setText("parliamentSubtitle", t("parliamentSubtitle"));
  setText("coalitionTitle", t("coalitionTitle"));
  setText("coalitionSubtitle", t("coalitionSubtitle"));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function normalizeData() {
  Object.keys(data).forEach(wkNr => {
    const wk = data[wkNr];

    if (!wk.erst && wk.values) wk.erst = { ...wk.values };
    if (!wk.zweit && wk.values) wk.zweit = { ...wk.values };

    if (!wk.erst) wk.erst = {};
    if (!wk.zweit) wk.zweit = {};

    wk.erst = normalizePartyNames(wk.erst);
    wk.zweit = normalizePartyNames(wk.zweit);

    if (!wk.name) wk.name = `Wahlkreis ${wkNr}`;
  });
}

function normalizePartyNames(values) {
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

function fmt(n) {
  return Number(n).toFixed(1);
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
    ...Array.from({ length: 6 }, (_, i) => 12 + i),
    ...Array.from({ length: 18 }, (_, i) => 56 + i),
    ...Array.from({ length: 12 }, (_, i) => 74 + i)
  ]);

  const urbanSet = new Set([
    11, 18, 19, 20, 21, 22, 23,
    74, 75, 80, 81, 82, 83,
    92, 93, 94
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
    const winner = getWinner(erst);

    path.style.fill = colorMap[winner] || "#ccc";
    path.setAttribute("fill-opacity", "1");

    path.onmousemove = (e) => {
      const current = source ? source[wkNr] : data[wkNr];
      renderTooltip(current, wkNr, e.pageX, e.pageY);
    };

    path.onmouseleave = () => {
      tooltip.style.display = "none";
    };
  });
}

function renderTooltip(current, wkNr, pageX, pageY) {
  const tooltip = document.getElementById("tooltip");
  const erst = current.erst || {};
  const zweit = current.zweit || {};

  const erstWinner = getWinner(erst);
  const zweitWinner = getWinner(zweit);

  let html = `<div class="tooltip-title">${current.name || `Wahlkreis ${wkNr}`}</div>`;
  html += buildTooltipBlock(t("firstVote"), erst, erstWinner);
  html += buildTooltipBlock(t("secondVote"), zweit, zweitWinner);

  tooltip.innerHTML = html;
  tooltip.style.left = pageX + 16 + "px";
  tooltip.style.top = pageY + 16 + "px";
  tooltip.style.display = "block";
}

function buildTooltipBlock(title, values, winner) {
  let html = `<div class="tooltip-block"><div class="tooltip-block-title">${title}</div>`;

  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, val]) => {
      const color = colorMap[party] || "#777";
      const bg = hexToRgba(color, 0.18);
      const border = hexToRgba(color, 0.42);
      const logo = logoMap[party];

      html += `
        <div class="tooltip-row" style="
          align-items:center;
          margin-bottom:6px;
          padding:6px 8px;
          border-radius:10px;
          background:${bg};
          border:1px solid ${border};
        ">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            ${logo ? `<img src="${logo}" alt="${party}" style="width:16px;height:16px;object-fit:contain;border-radius:3px;">` : ""}
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${party}${party === winner ? " ★" : ""}</span>
          </div>
          <strong>${fmt(val)}%</strong>
        </div>
      `;
    });

  html += `</div>`;
  return html;
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

  const seats = allocateSeatsSaintLague(validParties, TOTAL_SEATS);
  return { seats, directMandates, zweitNational };
}

function allocateSeatsSaintLague(voteShares, totalSeats) {
  const seatCounts = {};
  Object.keys(voteShares).forEach(p => seatCounts[p] = 0);

  const quotients = [];
  Object.keys(voteShares).forEach(party => {
    for (let d = 0; d < totalSeats * 2; d++) {
      const divisor = 0.5 + d;
      quotients.push({ party, value: voteShares[party] / divisor });
    }
  });

  quotients.sort((a, b) => b.value - a.value);

  for (let i = 0; i < totalSeats; i++) {
    seatCounts[quotients[i].party]++;
  }

  return seatCounts;
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

  let html = `<div style="margin-bottom:12px;"><strong>${t("simulatedSecondVote")}</strong></div>`;

  Object.entries(zweitNational || {})
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, val]) => {
      html += `<div class="seat-line"><span>${party}</span><span>${fmt(val)}%</span></div>`;
    });

  html += `<div style="margin:14px 0 8px;"><strong>${t("seatDistribution")}</strong></div>`;

  Object.entries(seats || {})
    .sort((a, b) => b[1] - a[1])
    .forEach(([party, count]) => {
      const direct = directMandates?.[party] || 0;
      const color = colorMap[party] || "#999";
      const logo = logoMap[party];

      html += `
        <div class="seat-line" style="color:${color};align-items:center;">
          <span style="display:flex;align-items:center;gap:8px;">
            ${logo ? `<img src="${logo}" alt="${party}" style="width:16px;height:16px;object-fit:contain;border-radius:3px;">` : ""}
            ${party}
          </span>
          <span>${count} <span style="color:#9aa4b2;font-weight:400;">(${direct} ${t("direct")})</span></span>
        </div>
      `;
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
    container.innerHTML = `<div>${t("noMajority")}</div>`;
    return;
  }

  combos.forEach(entry => {
    const comboKey = [...entry.combo].sort().join(" + ");
    const label = coalitionLabels[comboKey];

    const logos = entry.combo.map(party => {
      const src = logoMap[party];
      return src
        ? `<img src="${src}" alt="${party}" style="width:16px;height:16px;object-fit:contain;border-radius:3px;">`
        : "";
    }).join(" ");

    container.innerHTML += `
      <div style="padding:8px 0;display:flex;justify-content:space-between;gap:12px;align-items:center;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${label ? `<strong style="color:#fff;">${label}</strong>` : ""}
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            ${logos}
            <span>${entry.combo.join(" + ")}</span>
          </div>
        </div>
        <strong>${entry.total}</strong>
      </div>
    `;
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

  Object.entries(DEFAULT_FIELDS).forEach(([id, value]) => {
    document.getElementById(id).value = value;
  });

  simulatedData = null;
  colorMapByErststimme();
  displaySeatResult({}, {}, {});
  drawParliament({});
  buildCoalitions({});
}

loadMap();
