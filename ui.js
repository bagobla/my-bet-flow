function showTab(tabId, button) {
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  document.getElementById(tabId).classList.add("active");
  button.classList.add("active");
}

function updateBankrollList() {
  const select = document.getElementById("bankrollSelect");
  const input = document.getElementById("bankrollNameInput");
  const info = document.getElementById("bankrollInfo");

  if (!select) return;

  select.innerHTML = "";

  bankrolls.forEach(bankroll => {
    const option = document.createElement("option");
    option.value = bankroll.id;
    option.textContent = bankroll.name;
    select.appendChild(option);
  });

  select.value = activeBankrollId;

  const active = getActiveBankroll();

  if (input) input.value = active.name;
  if (info) info.textContent = "Bankroll active : " + active.name + " (" + bankrolls.length + "/10)";
}

function getVisibleTickets() {
  if (!activeDateFilter.start && !activeDateFilter.end) {
    return tickets;
  }

  return tickets.filter(t => {
    if (!t.date) return false;

    const ticketDate = new Date(t.date);
    const start = activeDateFilter.start ? new Date(activeDateFilter.start) : null;
    const end = activeDateFilter.end ? new Date(activeDateFilter.end) : null;

    if (start && ticketDate < start) return false;
    if (end && ticketDate > end) return false;

    return true;
  });
}

function getHistoryFilteredTickets() {
  let data = [...getVisibleTickets()];

  const sort = document.getElementById("historySort")?.value || "newest";
  const type = document.getElementById("historyTypeFilter")?.value || "";
  const status = document.getElementById("historyStatusFilter")?.value || "";
  const competition = document.getElementById("historyCompetitionFilter")?.value || "";
  const bookmaker = document.getElementById("historyBookmakerFilter")?.value || "";
  const team = document.getElementById("historyTeamFilter")?.value || "";

  if (type) data = data.filter(t => t.type === type);
  if (status) data = data.filter(t => t.status === status);
  if (competition) data = data.filter(t => t.selections.some(s => s.competition === competition));
  if (bookmaker) data = data.filter(t => (t.bookmaker || "Book non renseigné") === bookmaker);
  if (team) data = data.filter(t => t.selections.some(s => s.home === team || s.away === team));

  data.sort((a, b) => {
    const dateA = new Date(a.date || "1900-01-01");
    const dateB = new Date(b.date || "1900-01-01");

    if (sort === "oldest") return dateA - dateB;
    return dateB - dateA;
  });

  return data;
}

function updateHistoryFilterOptions() {
  const competitionSelect = document.getElementById("historyCompetitionFilter");
  const bookmakerSelect = document.getElementById("historyBookmakerFilter");
  const teamSelect = document.getElementById("historyTeamFilter");

  if (!competitionSelect || !bookmakerSelect || !teamSelect) return;

  const currentCompetition = competitionSelect.value;
  const currentBookmaker = bookmakerSelect.value;
  const currentTeam = teamSelect.value;

  const competitions = new Set();
  const bookmakersSet = new Set();
  const teamsSet = new Set();

  tickets.forEach(t => {
    bookmakersSet.add(t.bookmaker || "Book non renseigné");

    t.selections.forEach(s => {
      if (s.competition) competitions.add(s.competition);
      if (s.home) teamsSet.add(s.home);
      if (s.away) teamsSet.add(s.away);
    });
  });

  competitionSelect.innerHTML = `<option value="">Toutes les compétitions</option>`;
  [...competitions].sort().forEach(comp => competitionSelect.add(new Option(comp, comp)));
  competitionSelect.value = currentCompetition;

  bookmakerSelect.innerHTML = `<option value="">Tous les bookmakers</option>`;
  [...bookmakersSet].sort().forEach(book => bookmakerSelect.add(new Option(book, book)));
  bookmakerSelect.value = currentBookmaker;

  teamSelect.innerHTML = `<option value="">Toutes les équipes</option>`;
  [...teamsSet].sort().forEach(team => teamSelect.add(new Option(team, team)));
  teamSelect.value = currentTeam;
}

function resetHistoryFilters() {
  document.getElementById("historySort").value = "newest";
  document.getElementById("historyTypeFilter").value = "";
  document.getElementById("historyStatusFilter").value = "";
  document.getElementById("historyCompetitionFilter").value = "";
  document.getElementById("historyBookmakerFilter").value = "";
  document.getElementById("historyTeamFilter").value = "";

  displayTickets();
}

function setCapital() {
  capital = Number(document.getElementById("capitalInput").value) || 0;
  saveData();
  updateStats();
  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
  updateBankrollList();
  updateStakePercentDisplay();
}

function updateBookmakerList() {
  const bookmakerSelect = document.getElementById("bookmaker");
  bookmakerSelect.innerHTML = "";

  bookmakers.forEach(book => {
    const option = document.createElement("option");
    option.value = book;
    option.textContent = book;
    bookmakerSelect.appendChild(option);
  });
}

function updateCompetitionList() {
  const competitionSelect = document.getElementById("competition");
  competitionSelect.innerHTML = "";

  Object.keys(teamsByCompetition).forEach(comp => {
    const option = document.createElement("option");
    option.value = comp;
    option.textContent = comp;
    competitionSelect.appendChild(option);
  });

  updateTeamLists();
}

function isManualCompetitionMode() {
  const competition = document.getElementById("competition").value;
  const teams = teamsByCompetition[competition] || [];

  return competition === "Autre" || teams.length === 0;
}

function updateTeamLists() {
  const competition = document.getElementById("competition").value;
  let teams = teamsByCompetition[competition] || [];

  const teamsSelectBlock = document.getElementById("teamsSelectBlock");
  const teamsManualBlock = document.getElementById("teamsManualBlock");
  const customCompetition = document.getElementById("customCompetition");

  const manualMode = competition === "Autre" || teams.length === 0;

  if (manualMode) {
    teamsSelectBlock.classList.add("hidden");
    teamsManualBlock.classList.remove("hidden");
    customCompetition.classList.remove("hidden");
  } else {
    teamsSelectBlock.classList.remove("hidden");
    teamsManualBlock.classList.add("hidden");
    customCompetition.classList.add("hidden");
  }

  teams = [...teams].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  const home = document.getElementById("home");
  const away = document.getElementById("away");

  home.innerHTML = "";
  away.innerHTML = "";

  teams.forEach(team => {
    home.add(new Option(team, team));
    away.add(new Option(team, team));
  });

  if (teams.length > 1) away.selectedIndex = 1;

  filterTeams();
  updateFinalProno();
}

function filterTeams() {
  const home = document.getElementById("home");
  const away = document.getElementById("away");

  if (!home || !away) return;

  const h = home.value;
  const a = away.value;

  Array.from(away.options).forEach(o => o.disabled = (o.value === h));
  Array.from(home.options).forEach(o => o.disabled = (o.value === a));
}

document.addEventListener("change", e => {
  if (e.target.id === "home" || e.target.id === "away") {
    filterTeams();
    updateFinalProno();
  }
});

document.addEventListener("input", e => {
  if (
    e.target.id === "homeManual" ||
    e.target.id === "awayManual" ||
    e.target.id === "customCompetition"
  ) {
    updateFinalProno();
  }
});

function updateSubcategories() {
  const concern = document.getElementById("concern").value;
  const hiddenSub = document.getElementById("subcategory");
  const container = document.getElementById("subcategoryButtons");

  container.innerHTML = "";

  Object.keys(pronoData[concern]).forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cat;
    btn.className = "choice-btn";

    if (i === 0) {
      btn.classList.add("active");
      hiddenSub.value = cat;
    }

    btn.onclick = () => {
      hiddenSub.value = cat;
      container.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updatePronoTypes();
    };

    container.appendChild(btn);
  });

  updatePronoTypes();
}

function updatePronoTypes() {
  const concern = document.getElementById("concern").value;
  const sub = document.getElementById("subcategory").value;
  const container = document.getElementById("typeButtons");
  const hiddenType = document.getElementById("type");

  container.innerHTML = "";

  if (concern === "general" && (sub === "Buts" || sub === "Cartons" || sub === "VAR")) {
    const values = sub === "VAR"
      ? [0.5, 1.5]
      : [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5];

    values.forEach(val => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "6px";
      row.style.marginTop = "6px";

      const label = document.createElement("span");
      label.textContent = val.toString().replace(".", ",");
      label.style.minWidth = "35px";

      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.className = "type-btn";

      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "-";
      minus.className = "type-btn";

      plus.onclick = () => {
        hiddenType.value = "plus de " + val.toString().replace(".", ",") + " " + sub.toLowerCase();
        updateFinalProno();
      };

      minus.onclick = () => {
        hiddenType.value = "moins de " + val.toString().replace(".", ",") + " " + sub.toLowerCase();
        updateFinalProno();
      };

      row.append(label, plus, minus);
      container.appendChild(row);
    });

    hiddenType.value = "";
    updateFinalProno();
    return;
  }

  const list = pronoData[concern][sub];

  list.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = p;
    btn.className = "type-btn";

    if (i === 0) {
      btn.classList.add("active");
      hiddenType.value = p;
    }

    btn.onclick = () => {
      hiddenType.value = p;
      container.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateFinalProno();
    };

    container.appendChild(btn);
  });

  updateFinalProno();
}

function getCurrentCompetitionName() {
  const competition = document.getElementById("competition").value;

  if (isManualCompetitionMode()) {
    const custom = document.getElementById("customCompetition").value.trim();
    return custom || competition || "Autre";
  }

  return competition;
}

function getCurrentTeams() {
  if (isManualCompetitionMode()) {
    return {
      home: document.getElementById("homeManual").value.trim(),
      away: document.getElementById("awayManual").value.trim()
    };
  }

  return {
    home: document.getElementById("home").value,
    away: document.getElementById("away").value
  };
}

function updateFinalProno() {
  const teams = getCurrentTeams();
  const home = teams.home;
  const away = teams.away;

  const concern = document.getElementById("concern").value;
  const type = document.getElementById("type").value;
  const custom = document.getElementById("customProno");

  custom.classList.toggle("hidden", type !== "Autre / personnalisé");

  const text = type === "Autre / personnalisé" ? custom.value.trim() : type;
  let final = "";

  if (concern === "home") final = home + " " + text;
  else if (concern === "away") final = away + " " + text;
  else if (concern === "both") final = text;
  else final = home + " vs " + away + " — " + text;

  document.getElementById("finalProno").value = final;
}

function renderSelectionStatusButtons(index, currentStatus, mode, ticketIndex = null) {
  const statuses = [
    { icon: "⏳", value: "En attente", title: "En attente" },
    { icon: "✅", value: "Gagné", title: "Gagné" },
    { icon: "❌", value: "Perdu", title: "Perdu" },
    { icon: "↩️", value: "Remboursé", title: "Remboursé" }
  ];

  return `
    <div class="status-buttons">
      ${statuses.map(status => {
        const action = mode === "draft"
          ? `updateDraftSelectionStatus(${index}, '${status.value}')`
          : `updateSelectionStatus(${ticketIndex}, ${index}, '${status.value}')`;

        return `
          <button
            type="button"
            title="${status.title}"
            class="status-btn ${currentStatus === status.value ? "active" : ""}"
            onclick="${action}"
          >
            ${status.icon}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderDraft() {
  const container = document.getElementById("draftSelections");
  const ticketType = document.getElementById("ticketType").value;

  if (!draftSelections.length) {
    container.innerHTML = "<div class='small'>Aucune sélection.</div>";
    return;
  }

  container.innerHTML = draftSelections.map((s, i) => {
    const selectionStatusHtml = ticketType === "combine"
      ? `
        <div class="selection">
          <strong>Résultat sélection</strong>
          ${renderSelectionStatusButtons(i, s.status || "En attente", "draft")}
        </div>
      `
      : "";

    return `
      <div class="selection">
        <strong>${i + 1}. ${s.home} vs ${s.away}</strong><br>
        ${s.finalProno}<br>
        <span class="small">${s.competition} — Cote ${s.odds}</span>

        ${selectionStatusHtml}

        <button class="red" onclick="removeSelection(${i})">Supprimer</button>
      </div>
    `;
  }).join("");
}

function renderStatusButtons(realIndex, currentStatus) {
  const statuses = [
    { icon: "⏳", value: "En attente", title: "En attente" },
    { icon: "✅", value: "Gagné", title: "Gagné" },
    { icon: "❌", value: "Perdu", title: "Perdu" },
    { icon: "↩️", value: "Remboursé", title: "Remboursé" },
    { icon: "💸", value: "Cashout", title: "Cashout" }
  ];

  return `
    <div class="status-buttons">
      ${statuses.map(status => `
        <button
          type="button"
          title="${status.title}"
          class="status-btn ${currentStatus === status.value ? "active" : ""}"
          onclick="updateTicketStatus(${realIndex}, '${status.value}')"
        >
          ${status.icon}
        </button>
      `).join("")}
    </div>
  `;
}

function displayTickets() {
  updateHistoryFilterOptions();

  const container = document.getElementById("tickets");
  const visibleTickets = getHistoryFilteredTickets();

  if (!visibleTickets.length) {
    container.innerHTML = "<div class='small'>Aucun ticket avec ces filtres.</div>";
    return;
  }

  container.innerHTML = visibleTickets.map((t) => {
    const realIndex = tickets.indexOf(t);
    const gain = calculateGain(t);
    const label = t.type === "combine" ? "Combiné" : "Simple";
    const gainClass = gain > 0 ? "positive" : gain < 0 ? "negative" : "neutral";
    const percentText = typeof t.stakePercentAtCreation === "number"
      ? ` — ${t.stakePercentAtCreation.toFixed(2).replace(".", ",")} % bankroll au moment du pari`
      : "";

    const noteHtml = t.note
      ? `<div class="selection"><strong>Note personnelle :</strong><br>${t.note}</div>`
      : "";

    const cashoutHtml = t.status === "Cashout"
      ? `<input type="number" step="0.01" value="${t.cashout || ""}" placeholder="Montant cashout reçu" onchange="updateTicketCashout(${realIndex}, this.value)">`
      : "";

    return `
      <div class="ticket">
        <strong>${label} : ${t.status}</strong><br>

        <span class="small">
          ${t.date} — ${t.bookmaker || "Book non renseigné"} — Cote ${t.totalOdds} — Mise ${money(t.stake)}${percentText} — Gain <span class="${gainClass}">${money(gain)}</span>
        </span>

        ${t.selections.map((s, selectionIndex) => {
          const selectionStatusHtml = t.type === "combine"
            ? `
              <br>
              <span class="small">Sélection : ${s.status || "En attente"}</span>
              <div class="selection">
                <strong>Résultat sélection</strong>
                ${renderSelectionStatusButtons(selectionIndex, s.status || "En attente", "history", realIndex)}
              </div>
            `
            : "";

          return `
            <div class="selection">
              <strong>${s.home} vs ${s.away}</strong><br>
              ${s.finalProno}<br>
              <span class="small">${s.competition} — Cote ${s.odds}</span>
              ${selectionStatusHtml}
            </div>
          `;
        }).join("")}

        ${noteHtml}

        <div class="selection">
          <strong>Statut ticket</strong>
          ${renderStatusButtons(realIndex, t.status)}
          ${cashoutHtml}
        </div>

        <button class="gray" onclick="editTicket(${realIndex})">Modifier</button>
        <button class="red" onclick="deleteTicket(${realIndex})">Supprimer</button>
      </div>
    `;
  }).join("");

  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
}

function getSelectionStatus(selection, ticket) {
  if (ticket.type !== "combine") {
    if (ticket.status === "Gagné") return "Gagné";
    if (ticket.status === "Perdu") return "Perdu";
    if (ticket.status === "Remboursé") return "Remboursé";
    return "En attente";
  }

  if (selection.status) return selection.status;

  return "En attente";
}

function calculateTicketTypeStats(data, type) {
  const filtered = data.filter(t => t.type === type);
  const won = filtered.filter(t => t.status === "Gagné").length;
  const lost = filtered.filter(t => t.status === "Perdu").length;
  const pending = filtered.filter(t => t.status === "En attente").length;
  const refunded = filtered.filter(t => t.status === "Remboursé").length;
  const cashout = filtered.filter(t => t.status === "Cashout").length;
  const settled = won + lost;

  const profit = filtered
    .filter(t => t.status !== "En attente")
    .reduce((sum, t) => sum + calculateGain(t), 0);

  const pendingStake = filtered
    .filter(t => t.status === "En attente")
    .reduce((sum, t) => sum + Number(t.stake || 0), 0);

  const winrate = settled ? (won / settled) * 100 : 0;

  return {
    total: filtered.length,
    won,
    lost,
    pending,
    refunded,
    cashout,
    winrate,
    profit,
    pendingStake
  };
}

function displayDashboardStats() {
  const container = document.getElementById("dashboardStats");
  if (!container) return;

  const data = getVisibleTickets();

  const total = data.length;
  const won = data.filter(t => t.status === "Gagné").length;
  const lost = data.filter(t => t.status === "Perdu").length;
  const pending = data.filter(t => t.status === "En attente").length;
  const settled = won + lost;

  const settledProfit = calculateSettledProfit(data);
  const pendingStake = calculatePendingStake(data);
  const periodAvailable = capital + settledProfit - pendingStake;
  const winrate = settled ? (won / settled) * 100 : 0;

  const simpleStats = calculateTicketTypeStats(data, "simple");
  const combineStats = calculateTicketTypeStats(data, "combine");

  let bestComp = "Aucune";
  let bestProfit = null;

  const compStats = {};

  data.forEach(t => {
    const gain = calculateGain(t);
    const competitions = [...new Set(t.selections.map(s => s.competition || "Autre"))];

    competitions.forEach(comp => {
      if (!compStats[comp]) compStats[comp] = 0;
      compStats[comp] += gain / competitions.length;
    });
  });

  Object.entries(compStats).forEach(([comp, value]) => {
    if (bestProfit === null || value > bestProfit) {
      bestProfit = value;
      bestComp = comp;
    }
  });

  const profitClass = settledProfit > 0 ? "positive" : settledProfit < 0 ? "negative" : "neutral";
  const simpleProfitClass = simpleStats.profit > 0 ? "positive" : simpleStats.profit < 0 ? "negative" : "neutral";
  const combineProfitClass = combineStats.profit > 0 ? "positive" : combineStats.profit < 0 ? "negative" : "neutral";

  container.innerHTML = `
    <div class="dashboard-card">
      <span>Tickets</span>
      <strong>${total}</strong>
    </div>

    <div class="dashboard-card">
      <span>Gagnés / Perdus</span>
      <strong>${won} / ${lost}</strong>
    </div>

    <div class="dashboard-card">
      <span>En attente</span>
      <strong>${pending}</strong>
    </div>

    <div class="dashboard-card">
      <span>Mises en cours</span>
      <strong>${money(pendingStake)}</strong>
    </div>

    <div class="dashboard-card">
      <span>Winrate ticket</span>
      <strong>${winrate.toFixed(1).replace(".", ",")} %</strong>
    </div>

    <div class="dashboard-card">
      <span>Profit terminés</span>
      <strong class="${profitClass}">${money(settledProfit)}</strong>
    </div>

    <div class="dashboard-card">
      <span>Capital dispo période</span>
      <strong>${money(periodAvailable)}</strong>
    </div>

    <div class="dashboard-card">
      <span>Meilleure compétition</span>
      <strong>${bestComp}</strong>
    </div>

    <div class="dashboard-card">
      <span>Paris simples</span>
      <strong>${simpleStats.total}</strong>
      <span>G/P : ${simpleStats.won} / ${simpleStats.lost}</span>
      <span>Attente : ${simpleStats.pending}</span>
      <span>Winrate : ${simpleStats.winrate.toFixed(1).replace(".", ",")} %</span>
      <span class="${simpleProfitClass}">Profit : ${money(simpleStats.profit)}</span>
    </div>

    <div class="dashboard-card">
      <span>Combinés</span>
      <strong>${combineStats.total}</strong>
      <span>G/P : ${combineStats.won} / ${combineStats.lost}</span>
      <span>Attente : ${combineStats.pending}</span>
      <span>Winrate : ${combineStats.winrate.toFixed(1).replace(".", ",")} %</span>
      <span class="${combineProfitClass}">Profit : ${money(combineStats.profit)}</span>
    </div>
  `;
}

function displayStatsByCompetition() {
  const container = document.getElementById("statsCompetition");
  if (!container) return;

  const data = getVisibleTickets();
  const stats = {};

  data.forEach(t => {
    const gain = calculateGain(t);
    const competitions = [...new Set(t.selections.map(s => s.competition || "Autre"))];

    t.selections.forEach(s => {
      const comp = s.competition || "Autre";
      const selectionStatus = getSelectionStatus(s, t);

      if (!stats[comp]) {
        stats[comp] = {
          selections: 0,
          won: 0,
          lost: 0,
          pending: 0,
          refunded: 0,
          profit: 0,
          pendingStake: 0
        };
      }

      stats[comp].selections += 1;

      if (selectionStatus === "Gagné") stats[comp].won += 1;
      if (selectionStatus === "Perdu") stats[comp].lost += 1;
      if (selectionStatus === "En attente") stats[comp].pending += 1;
      if (selectionStatus === "Remboursé") stats[comp].refunded += 1;
    });

    competitions.forEach(comp => {
      if (!stats[comp]) {
        stats[comp] = {
          selections: 0,
          won: 0,
          lost: 0,
          pending: 0,
          refunded: 0,
          profit: 0,
          pendingStake: 0
        };
      }

      if (t.status === "En attente") {
        stats[comp].pendingStake += Number(t.stake || 0) / competitions.length;
      } else {
        stats[comp].profit += gain / competitions.length;
      }
    });
  });

  const entries = Object.entries(stats);

  if (!entries.length) {
    container.innerHTML = "<div class='small'>Aucune donnée sur cette période.</div>";
    return;
  }

  container.innerHTML = entries.map(([comp, d]) => {
    const settled = d.won + d.lost;
    const winrate = settled ? (d.won / settled) * 100 : 0;
    const profitClass = d.profit > 0 ? "positive" : d.profit < 0 ? "negative" : "neutral";

    return `
      <div class="stat">
        <strong>${comp}</strong><br>
        Sélections : ${d.selections}<br>
        Sélections gagnées / perdues : ${d.won} / ${d.lost}<br>
        Sélections en attente : ${d.pending}<br>
        Sélections remboursées : ${d.refunded}<br>
        Winrate sélections : ${winrate.toFixed(1).replace(".", ",")} %<br>
        Mises en cours : ${money(d.pendingStake)}<br>
        Profit ticket réparti : <span class="${profitClass}">${money(d.profit)}</span>
      </div>
    `;
  }).join("");
}

function displayStatsByBookmaker() {
  const container = document.getElementById("statsBookmakers");
  if (!container) return;

  const data = getVisibleTickets();
  const stats = {};

  data.forEach(t => {
    const book = t.bookmaker || "Book non renseigné";
    const gain = calculateGain(t);

    if (!stats[book]) {
      stats[book] = {
        profit: 0,
        tickets: 0,
        won: 0,
        lost: 0,
        pendingStake: 0,
        selections: 0,
        selectionWon: 0,
        selectionLost: 0,
        selectionPending: 0,
        selectionRefunded: 0
      };
    }

    if (t.status === "En attente") {
      stats[book].pendingStake += Number(t.stake || 0);
    } else {
      stats[book].profit += gain;
    }

    stats[book].tickets += 1;

    if (t.status === "Gagné") stats[book].won += 1;
    if (t.status === "Perdu") stats[book].lost += 1;

    t.selections.forEach(s => {
      const selectionStatus = getSelectionStatus(s, t);

      stats[book].selections += 1;
      if (selectionStatus === "Gagné") stats[book].selectionWon += 1;
      if (selectionStatus === "Perdu") stats[book].selectionLost += 1;
      if (selectionStatus === "En attente") stats[book].selectionPending += 1;
      if (selectionStatus === "Remboursé") stats[book].selectionRefunded += 1;
    });
  });

  const entries = Object.entries(stats);

  if (!entries.length) {
    container.innerHTML = "<div class='small'>Aucune donnée sur cette période.</div>";
    return;
  }

  container.innerHTML = entries.map(([book, d]) => {
    const settled = d.won + d.lost;
    const winrate = settled ? (d.won / settled) * 100 : 0;

    const selectionSettled = d.selectionWon + d.selectionLost;
    const selectionWinrate = selectionSettled ? (d.selectionWon / selectionSettled) * 100 : 0;

    const profitClass = d.profit > 0 ? "positive" : d.profit < 0 ? "negative" : "neutral";

    return `
      <div class="stat">
        <strong>${book}</strong><br>
        Tickets : ${d.tickets}<br>
        Tickets gagnés / perdus : ${d.won} / ${d.lost}<br>
        Winrate tickets : ${winrate.toFixed(1).replace(".", ",")} %<br>
        Sélections : ${d.selections}<br>
        Sélections gagnées / perdues : ${d.selectionWon} / ${d.selectionLost}<br>
        Sélections en attente : ${d.selectionPending}<br>
        Sélections remboursées : ${d.selectionRefunded}<br>
        Winrate sélections : ${selectionWinrate.toFixed(1).replace(".", ",")} %<br>
        Mises en cours : ${money(d.pendingStake)}<br>
        Profit terminés : <span class="${profitClass}">${money(d.profit)}</span>
      </div>
    `;
  }).join("");
}