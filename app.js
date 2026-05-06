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
}

function updateSelectionStatus(ticketIndex, selectionIndex, newStatus) {
  if (!tickets[ticketIndex] || !tickets[ticketIndex].selections[selectionIndex]) return;

  tickets[ticketIndex].selections[selectionIndex].status = newStatus;

  saveData();
  displayTickets();
  displayDashboardStats();
  displayStatsByCompetition();
  displayStatsByBookmaker();
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

document.getElementById("ticketDate").value = new Date().toISOString().slice(0, 10);

refreshAll();