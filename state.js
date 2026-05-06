let bankrolls = JSON.parse(localStorage.getItem("myBetFlowBankrolls")) || null;
let activeBankrollId = localStorage.getItem("myBetFlowActiveBankrollId") || null;

if (!bankrolls || bankrolls.length === 0) {
  const backup = localStorage.getItem("myBetFlowBackup");

  if (backup) {
    try {
      const parsedBackup = JSON.parse(backup);

      if (parsedBackup.bankrolls && parsedBackup.bankrolls.length > 0) {
        bankrolls = parsedBackup.bankrolls;
        activeBankrollId = parsedBackup.activeBankrollId || bankrolls[0].id;
      }
    } catch (e) {
      console.error("Erreur lecture backup", e);
    }
  }
}

if (!bankrolls || bankrolls.length === 0) {
  const oldTickets = JSON.parse(localStorage.getItem("myBetFlowTickets")) || [];
  const oldCapital = Number(localStorage.getItem("myBetFlowCapital")) || 0;

  bankrolls = [
    {
      id: "bankroll_" + Date.now(),
      name: "Bankroll principale",
      capital: oldCapital,
      tickets: oldTickets
    }
  ];

  activeBankrollId = bankrolls[0].id;
  localStorage.setItem("myBetFlowBankrolls", JSON.stringify(bankrolls));
  localStorage.setItem("myBetFlowActiveBankrollId", activeBankrollId);
}

let tickets = [];
let capital = 0;
let draftSelections = [];
let editingTicketIndex = null;

function getActiveBankroll() {
  return bankrolls.find(b => b.id === activeBankrollId) || bankrolls[0];
}

function syncActiveBankroll() {
  const active = getActiveBankroll();

  activeBankrollId = active.id;
  tickets = active.tickets || [];
  capital = Number(active.capital) || 0;

  loadDraft();
}

function createBackupSnapshot() {
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    bankrolls,
    activeBankrollId
  };

  localStorage.setItem("myBetFlowBackup", JSON.stringify(data));

  const backupHistory = JSON.parse(localStorage.getItem("myBetFlowBackupHistory")) || [];
  backupHistory.push(data);

  while (backupHistory.length > 5) {
    backupHistory.shift();
  }

  localStorage.setItem("myBetFlowBackupHistory", JSON.stringify(backupHistory));
}

function saveBankrolls() {
  localStorage.setItem("myBetFlowBankrolls", JSON.stringify(bankrolls));
  localStorage.setItem("myBetFlowActiveBankrollId", activeBankrollId);
  createBackupSnapshot();
}

function saveData() {
  const active = getActiveBankroll();

  active.capital = capital;
  active.tickets = tickets;

  saveBankrolls();
}

function switchBankroll(bankrollId) {
  saveData();

  activeBankrollId = bankrollId;
  editingTicketIndex = null;

  syncActiveBankroll();
  saveBankrolls();
}

function createBankroll(name) {
  if (bankrolls.length >= 10) {
    alert("Tu peux créer 10 bankrolls maximum.");
    return;
  }

  const cleanName = name.trim() || "Nouvelle bankroll";

  const newBankroll = {
    id: "bankroll_" + Date.now(),
    name: cleanName,
    capital: 0,
    tickets: []
  };

  bankrolls.push(newBankroll);
  activeBankrollId = newBankroll.id;

  syncActiveBankroll();
  saveBankrolls();
}

function renameActiveBankroll(newName) {
  const active = getActiveBankroll();
  const cleanName = newName.trim();

  if (!cleanName) {
    alert("Ajoute un nom de bankroll.");
    return;
  }

  active.name = cleanName;
  saveBankrolls();
}

function deleteActiveBankroll() {
  if (bankrolls.length <= 1) {
    alert("Tu dois garder au moins une bankroll.");
    return;
  }

  bankrolls = bankrolls.filter(b => b.id !== activeBankrollId);
  activeBankrollId = bankrolls[0].id;

  syncActiveBankroll();
  saveBankrolls();
}

function money(n) {
  return Number(n || 0).toFixed(2).replace(".", ",") + " €";
}

function getDraftKey() {
  return "myBetFlowDraftSelections_" + activeBankrollId;
}

function loadDraft() {
  draftSelections = JSON.parse(localStorage.getItem(getDraftKey())) || [];
}

function saveDraft() {
  localStorage.setItem(getDraftKey(), JSON.stringify(draftSelections));
}

function clearDraftStorage() {
  localStorage.removeItem(getDraftKey());
}

function exportData() {
  saveData();

  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    bankrolls,
    activeBankrollId
  };

  const json = JSON.stringify(data);

  const exportField = document.getElementById("exportDataField");
  if (exportField) {
    exportField.value = json;
    exportField.select();
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(json)
      .then(() => {
        alert("Sauvegarde copiée dans le presse-papiers et affichée dans le champ export.");
      })
      .catch(() => {
        alert("Sauvegarde affichée dans le champ export. Copie-la manuellement.");
      });
  } else {
    alert("Sauvegarde affichée dans le champ export. Copie-la manuellement.");
  }
}

function importData() {
  const field = document.getElementById("importDataField");

  if (!field || !field.value.trim()) {
    alert("Colle une sauvegarde avant d’importer.");
    return;
  }

  try {
    const data = JSON.parse(field.value.trim());

    if (!data.bankrolls || !Array.isArray(data.bankrolls)) {
      alert("Sauvegarde invalide : bankrolls introuvables.");
      return;
    }

    if (!confirm("Importer cette sauvegarde va remplacer les données actuelles. Continuer ?")) {
      return;
    }

    bankrolls = data.bankrolls;
    activeBankrollId = data.activeBankrollId || bankrolls[0].id;

    syncActiveBankroll();
    saveBankrolls();

    alert("Import terminé.");
    location.reload();
  } catch (e) {
    alert("Format invalide. Vérifie que tu as bien collé toute la sauvegarde.");
  }
}

function restoreBackup() {
  const backup = localStorage.getItem("myBetFlowBackup");

  if (!backup) {
    alert("Aucune sauvegarde automatique trouvée.");
    return;
  }

  if (!confirm("Restaurer la dernière sauvegarde automatique ? Les données actuelles seront remplacées.")) {
    return;
  }

  try {
    const data = JSON.parse(backup);

    if (!data.bankrolls || !Array.isArray(data.bankrolls)) {
      alert("Sauvegarde automatique invalide.");
      return;
    }

    bankrolls = data.bankrolls;
    activeBankrollId = data.activeBankrollId || bankrolls[0].id;

    syncActiveBankroll();
    saveBankrolls();

    alert("Sauvegarde automatique restaurée.");
    location.reload();
  } catch (e) {
    alert("Impossible de restaurer la sauvegarde automatique.");
  }
}

syncActiveBankroll();
createBackupSnapshot();