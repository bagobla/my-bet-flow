let activeDateFilter = {
  start: "",
  end: ""
};

function refreshAll() {
  updateBankrollList();
  updateBookmakerList();
  updateCompetitionList();
  updateSubcategories();
  updateTotalOdds();
  renderDraft();
  displayTickets();
  updateStats();
  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
  updateStakePercentDisplay();
  renderBankrollChart();
}

function handleBankrollChange() {
  const selectedId = document.getElementById("bankrollSelect").value;

  switchBankroll(selectedId);
  resetDateFilter();
  resetHistoryFilters();

  document.getElementById("capitalInput").value = "";
  refreshAll();
}

function createBankrollFromInput() {
  const name = document.getElementById("bankrollNameInput").value;

  createBankroll(name);
  resetDateFilter();
  resetHistoryFilters();

  document.getElementById("capitalInput").value = "";
  refreshAll();
}

function renameActiveBankrollFromInput() {
  const name = document.getElementById("bankrollNameInput").value;

  renameActiveBankroll(name);
  refreshAll();
}

function deleteActiveBankrollConfirm() {
  const active = getActiveBankroll();

  if (!confirm("Supprimer la bankroll : " + active.name + " ?")) return;

  deleteActiveBankroll();
  resetDateFilter();
  resetHistoryFilters();

  document.getElementById("capitalInput").value = "";
  refreshAll();
}

function applyDateFilter() {
  const start = document.getElementById("filterStartDate").value;
  const end = document.getElementById("filterEndDate").value;

  if (start && end && new Date(start) > new Date(end)) {
    alert("La date de début ne peut pas être après la date de fin.");
    return;
  }

  activeDateFilter.start = start;
  activeDateFilter.end = end;

  const info = document.getElementById("filterInfo");

  if (!start && !end) {
    info.textContent = "Filtre actif : aucun";
  } else if (start && end) {
    info.textContent = "Filtre actif : du " + start + " au " + end;
  } else if (start) {
    info.textContent = "Filtre actif : depuis le " + start;
  } else {
    info.textContent = "Filtre actif : jusqu’au " + end;
  }

  displayTickets();
  updateStats();
  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
  updateStakePercentDisplay();
  renderBankrollChart();
}

function resetDateFilter() {
  activeDateFilter.start = "";
  activeDateFilter.end = "";

  const startInput = document.getElementById("filterStartDate");
  const endInput = document.getElementById("filterEndDate");
  const info = document.getElementById("filterInfo");

  if (startInput) startInput.value = "";
  if (endInput) endInput.value = "";
  if (info) info.textContent = "Filtre actif : aucun";

  displayTickets();
  updateStats();
  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
  updateStakePercentDisplay();
  renderBankrollChart();
}

function getCurrentCompetitionName() {
  const competition = document.getElementById("competition").value;
  const teams = teamsByCompetition[competition] || [];

  if (competition === "Autre" || teams.length === 0) {
    const custom = document.getElementById("customCompetition").value.trim();
    return custom || competition || "Autre";
  }

  return competition;
}

function getCurrentTeams() {
  const competition = document.getElementById("competition").value;
  const teams = teamsByCompetition[competition] || [];

  if (competition === "Autre" || teams.length === 0) {
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

function addSelection() {
  const competition = getCurrentCompetitionName();
  const teams = getCurrentTeams();
  const home = teams.home;
  const away = teams.away;

  const finalProno = document.getElementById("finalProno").value.trim();
  const odds = Number(document.getElementById("selectionOdds").value);

  if (!competition) return alert("Choisis ou saisis une compétition.");
  if (!home || !away) return alert("Choisis ou saisis les deux équipes.");
  if (home === away) return alert("Les deux équipes doivent être différentes.");
  if (!finalProno) return alert("Choisis un prono.");
  if (!odds || odds < 1) return alert("Ajoute une cote valide.");

  const selection = {
    competition,
    home,
    away,
    finalProno,
    odds,
    status: "En attente"
  };

  if (document.getElementById("ticketType").value === "simple") {
    draftSelections = [selection];
  } else {
    draftSelections.push(selection);
  }

  document.getElementById("selectionOdds").value = "";

  updateTotalOdds();
  renderDraft();
  saveDraft();
}

function updateDraftSelectionStatus(index, newStatus) {
  if (!draftSelections[index]) return;

  draftSelections[index].status = newStatus;

  renderDraft();
  saveDraft();
}

function updateTotalOdds() {
  if (draftSelections.length === 0) {
    document.getElementById("totalOdds").value = "";
    return;
  }

  const total = draftSelections.reduce((acc, s) => acc * Number(s.odds), 1);
  document.getElementById("totalOdds").value = total.toFixed(2);
}

function removeSelection(index) {
  draftSelections.splice(index, 1);
  updateTotalOdds();
  renderDraft();
  saveDraft();
}

function toggleCashout() {
  const status = document.getElementById("status").value;
  document.getElementById("cashout").classList.toggle("hidden", status !== "Cashout");
}

function calculateGain(ticket) {
  const stake = Number(ticket.stake) || 0;
  const odds = Number(ticket.totalOdds) || 0;

  if (ticket.status === "Gagné") return stake * odds - stake;
  if (ticket.status === "Perdu") return -stake;
  if (ticket.status === "Remboursé") return 0;
  if (ticket.status === "Cashout") return (Number(ticket.cashout) || 0) - stake;

  return 0;
}

function calculatePendingStake(ticketList = tickets) {
  return ticketList
    .filter(t => t.status === "En attente")
    .reduce((sum, t) => sum + Number(t.stake || 0), 0);
}

function calculateSettledProfit(ticketList = tickets) {
  return ticketList
    .filter(t => t.status !== "En attente")
    .reduce((sum, t) => sum + calculateGain(t), 0);
}

function calculateAvailableCapital() {
  const settledProfit = calculateSettledProfit(tickets);
  const pendingStake = calculatePendingStake(tickets);
  return capital + settledProfit - pendingStake;
}

function calculateStakePercent(stake) {
  const availableCapital = calculateAvailableCapital();

  if (!stake || stake <= 0 || !availableCapital || availableCapital <= 0) {
    return 0;
  }

  return (stake / availableCapital) * 100;
}

function updateStakePercentDisplay() {
  const preview = document.getElementById("stakePercentPreview");
  const stakeInput = document.getElementById("stake");

  if (!preview || !stakeInput) return;

  const stake = Number(stakeInput.value) || 0;
  const percent = calculateStakePercent(stake);

  preview.textContent = percent.toFixed(2).replace(".", ",") + " %";
}

function updateTicketStatus(index, newStatus) {
  if (!tickets[index]) return;

  tickets[index].status = newStatus;

  if (newStatus !== "Cashout") {
    tickets[index].cashout = 0;
  }

  saveData();
  displayTickets();
  updateStats();
  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
  updateStakePercentDisplay();
  renderBankrollChart();
}

function updateTicketCashout(index, value) {
  if (!tickets[index]) return;

  tickets[index].cashout = Number(value) || 0;

  saveData();
  displayTickets();
  updateStats();
  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
  updateStakePercentDisplay();
  renderBankrollChart();
}

function updateSelectionStatus(ticketIndex, selectionIndex, newStatus) {
  if (!tickets[ticketIndex] || !tickets[ticketIndex].selections[selectionIndex]) return;

  tickets[ticketIndex].selections[selectionIndex].status = newStatus;

  saveData();
  displayTickets();
  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
  renderBankrollChart();
}

function saveTicket() {
  const stake = Number(document.getElementById("stake").value);
  const totalOdds = Number(document.getElementById("totalOdds").value);
  const status = document.getElementById("status").value;
  const bookmaker = document.getElementById("bookmaker").value;
  const stakePercentAtCreation = calculateStakePercent(stake);

  if (draftSelections.length === 0) return alert("Ajoute au moins une sélection.");
  if (!bookmaker) return alert("Choisis un bookmaker.");
  if (!stake || stake <= 0) return alert("Ajoute une mise valide.");
  if (!totalOdds || totalOdds < 1) return alert("Ajoute une cote totale valide.");

  if (status === "Cashout") {
    const cashout = Number(document.getElementById("cashout").value);
    if (!cashout || cashout <= 0) return alert("Ajoute le montant du cashout.");
  }

  const ticket = {
    type: document.getElementById("ticketType").value,
    date: document.getElementById("ticketDate").value,
    bookmaker,
    selections: draftSelections.map(s => ({
      ...s,
      status: s.status || "En attente"
    })),
    totalOdds,
    stake,
    stakePercentAtCreation,
    status,
    cashout: Number(document.getElementById("cashout").value) || 0,
    note: document.getElementById("note").value.trim()
  };

  if (editingTicketIndex !== null) {
    tickets[editingTicketIndex] = ticket;
    editingTicketIndex = null;
  } else {
    tickets.push(ticket);
  }

  saveData();
  clearDraftStorage();

  resetForm();
  refreshAll();
}

function editTicket(index) {
  const t = tickets[index];

  editingTicketIndex = index;
  draftSelections = t.selections.map(s => ({
    ...s,
    status: s.status || "En attente"
  }));

  document.getElementById("ticketType").value = t.type;
  document.getElementById("ticketDate").value = t.date;
  document.getElementById("bookmaker").value = t.bookmaker || "";
  document.getElementById("totalOdds").value = t.totalOdds;
  document.getElementById("stake").value = t.stake;
  document.getElementById("status").value = t.status;
  document.getElementById("cashout").value = t.cashout || "";
  document.getElementById("note").value = t.note || "";

  toggleCashout();
  updateTotalOdds();
  renderDraft();
  saveDraft();
  updateStakePercentDisplay();

  window.scrollTo(0, 0);
}

function deleteTicket(index) {
  tickets.splice(index, 1);

  saveData();
  refreshAll();
}

function resetDraft() {
  draftSelections = [];
  updateTotalOdds();
  renderDraft();
  saveDraft();
}

function resetForm() {
  editingTicketIndex = null;
  draftSelections = [];

  document.getElementById("selectionOdds").value = "";
  document.getElementById("totalOdds").value = "";
  document.getElementById("stake").value = "";
  document.getElementById("cashout").value = "";
  document.getElementById("note").value = "";
  document.getElementById("status").value = "En attente";
  document.getElementById("customProno").value = "";

  toggleCashout();
  updateTotalOdds();
  renderDraft();
  saveDraft();
  updateStakePercentDisplay();
}

function updateStats() {
  const settledProfit = calculateSettledProfit(tickets);
  const pendingStake = calculatePendingStake(tickets);
  const availableCapital = capital + settledProfit - pendingStake;

  const totalStake = tickets
    .filter(t => t.status !== "En attente")
    .reduce((sum, t) => sum + Number(t.stake || 0), 0);

  const roi = totalStake ? (settledProfit / totalStake) * 100 : 0;

  document.getElementById("startCapital").textContent = money(capital);
  document.getElementById("pendingStakeTotal").textContent = money(pendingStake);
  document.getElementById("currentCapital").textContent = money(availableCapital);
  document.getElementById("profitTotal").textContent = money(settledProfit);
  document.getElementById("roiTotal").textContent = roi.toFixed(1).replace(".", ",") + " %";
}

function buildBankrollTimeline() {
  const sortedTickets = [...tickets].sort((a, b) => {
    const dateA = new Date(a.date || "1900-01-01");
    const dateB = new Date(b.date || "1900-01-01");
    return dateA - dateB;
  });

  let runningCapital = Number(capital) || 0;

  const points = [
    {
      label: "Départ",
      value: runningCapital
    }
  ];

  sortedTickets.forEach((ticket, index) => {
    if (ticket.status === "En attente") {
      runningCapital -= Number(ticket.stake || 0);
    } else {
      runningCapital += calculateGain(ticket);
    }

    points.push({
      label: ticket.date || "Ticket " + (index + 1),
      value: runningCapital
    });
  });

  return points;
}

function renderBankrollChart() {
  const canvas = document.getElementById("bankrollChart");
  const summary = document.getElementById("bankrollChartSummary");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const parent = canvas.parentElement;
  const width = parent.clientWidth - 20;
  const height = 220;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const points = buildBankrollTimeline();

  if (points.length <= 1) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Ajoute des tickets pour afficher l’évolution.", width / 2, height / 2);

    if (summary) {
      summary.innerHTML = "Aucune évolution disponible pour le moment.";
    }

    return;
  }

  const values = points.map(p => p.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = 28;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const valueRange = maxValue - minValue || 1;

  const getX = index => {
    if (points.length === 1) return padding;
    return padding + (index / (points.length - 1)) * graphWidth;
  };

  const getY = value => {
    return padding + ((maxValue - value) / valueRange) * graphHeight;
  };

  ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const startValue = values[0];
  const endValue = values[values.length - 1];
  const isPositive = endValue >= startValue;

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#1e88ff");
  gradient.addColorStop(1, isPositive ? "#67e8f9" : "#fb7185");

  ctx.beginPath();

  points.forEach((point, index) => {
    const x = getX(index);
    const y = getY(point.value);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = getX(index - 1);
      const prevY = getY(points[index - 1].value);
      const midX = (prevX + x) / 2;

      ctx.bezierCurveTo(midX, prevY, midX, y, x, y);
    }
  });

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();

  const fillGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  fillGradient.addColorStop(0, isPositive ? "rgba(56, 189, 248, 0.22)" : "rgba(251, 113, 133, 0.18)");
  fillGradient.addColorStop(1, "rgba(2, 6, 23, 0)");

  ctx.fillStyle = fillGradient;
  ctx.fill();

  points.forEach((point, index) => {
    const x = getX(index);
    const y = getY(point.value);

    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = isPositive ? "#67e8f9" : "#fb7185";
    ctx.fill();
  });

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px Arial";
  ctx.textAlign = "left";
  ctx.fillText(money(maxValue), 6, padding + 4);
  ctx.fillText(money(minValue), 6, height - padding + 4);

  const evolution = endValue - startValue;
  const evolutionClass = evolution > 0 ? "positive" : evolution < 0 ? "negative" : "neutral";

  if (summary) {
    summary.innerHTML = `
      Départ : <strong>${money(startValue)}</strong><br>
      Actuel : <strong>${money(endValue)}</strong><br>
      Évolution : <strong class="${evolutionClass}">${money(evolution)}</strong>
    `;
  }
}

window.addEventListener("resize", () => {
  renderBankrollChart();
});

document.getElementById("ticketDate").value = new Date().toISOString().slice(0, 10);

refreshAll();