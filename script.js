let data;

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

async function loadMap() {

  const svg = await fetch("assets/btw25_wahlkreise_svg.svg")
      .then(r => r.text());

  document.getElementById("map").innerHTML = svg;

  data = await fetch("data/wahlkreise_2025.json")
      .then(r => r.json());

  colorMapByErststimme();
}

function colorMapByErststimme() {

  const paths = document.querySelectorAll("path");
  const tooltip = document.getElementById("tooltip");

  paths.forEach((path, index) => {

    const wkNr = (index + 1).toString();
    if (!data[wkNr]) return;

    const erst = data[wkNr].erst;

    let winner = Object.keys(erst).reduce((a,b) =>
      erst[a] > erst[b] ? a : b
    );

    path.style.fill = colorMap[winner] || "#ccc";

    path.addEventListener("mousemove", (e) => {

      const zweit = data[wkNr].zweit;

      let html = `<strong>Wahlkreis ${wkNr}</strong><br><br>
                  <u>Erststimme:</u><br>`;

      Object.entries(erst)
        .sort((a,b) => b[1] - a[1])
        .forEach(([party, val]) => {
          html += `${party}: ${val.toFixed(2)}%<br>`;
        });

      html += "<br><u>Zweitstimme:</u><br>";

      Object.entries(zweit)
        .sort((a,b) => b[1] - a[1])
        .forEach(([party, val]) => {
          html += `${party}: ${val.toFixed(2)}%<br>`;
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

  const zweitNational = {
    "CDU": parseFloat(CDU_input.value) || 0,
    "CSU": parseFloat(CSU_input.value) || 0,
    "AfD": parseFloat(AfD_input.value) || 0,
    "SPD": parseFloat(SPD_input.value) || 0,
    "GRÜNE": parseFloat(GRUENE_input.value) || 0,
    "Die Linke": parseFloat(LINKE_input.value) || 0,
    "FDP": parseFloat(FDP_input.value) || 0,
    "BSW": parseFloat(BSW_input.value) || 0
  };

  calculateSeats(zweitNational);
}

function calculateSeats(zweitNational) {

  let directMandates = {};

  // 1️⃣ Direktmandate nur aus Erststimme
  Object.keys(data).forEach(wkNr => {

    const erst = data[wkNr].erst;

    let winner = Object.keys(erst).reduce((a,b) =>
      erst[a] > erst[b] ? a : b
    );

    directMandates[winner] =
      (directMandates[winner] || 0) + 1;
  });

  // 2️⃣ Parteien zulassen (5% oder 3 Direktmandate)
  let validParties = {};

  Object.keys(zweitNational).forEach(party => {

    if (
      zweitNational[party] >= 5 ||
      (directMandates[party] || 0) >= 3
    ) {
      validParties[party] = zweitNational[party];
    }
  });

  // 3️⃣ Prozent normieren
  let totalPercent = Object.values(validParties)
    .reduce((a,b) => a + b, 0);

  Object.keys(validParties).forEach(party => {
    validParties[party] =
      validParties[party] / totalPercent;
  });

  // 4️⃣ Sitze proportional verteilen
  let seats = {};

  Object.keys(validParties).forEach(party => {
    seats[party] =
      Math.round(validParties[party] * TOTAL_SEATS);
  });

  // 5️⃣ CDU + CSU → Union
  if (seats["CDU"] || seats["CSU"]) {
    seats["Union"] =
      (seats["CDU"] || 0) + (seats["CSU"] || 0);
    delete seats["CDU"];
    delete seats["CSU"];
  }

  displaySeatResult(seats);
  drawParliament(seats);
  buildCoalitions(seats);
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

function buildCoalitions(seats) {

  const container = document.getElementById("coalition");
  container.innerHTML = "<h4>Automatische Mehrheits-Koalitionen:</h4>";

  const parties = Object.keys(seats);

  function sum(combo) {
    return combo.reduce((s,p)=> s + seats[p],0);
  }

  for (let i=0;i<parties.length;i++){
    for (let j=i+1;j<parties.length;j++){

      const combo = [parties[i], parties[j]];
      const total = sum(combo);

      if (total >= MAJORITY){
        container.innerHTML +=
          `<div>${combo.join(" + ")} → <strong>${total}</strong></div>`;
      }
    }
  }
}

loadMap();
