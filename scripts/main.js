const keys = { transactions: "studentFinanceTracker.transactions", settings: "studentFinanceTracker.settings", editing: "studentFinanceTracker.editingTransactionId" };
const defaults = { currency: "RWF", usdRate: "", eurRate: "", spendingCap: 0 };
const sampleRows = [
  ["Lunch", 3500, "food", "2026-06-19"],
  ["book", 45000, "fees", "2026-06-18"],
];
const get = (id) => document.getElementById(id);

function readData(key, backup) {
  try {
    let saved = localStorage.getItem(key);
    return saved === null ? backup : JSON.parse(saved);
  } catch (error) {
    console.error("Could not read saved data:", error);
    return backup;
  }
}
function validTransaction(item) {
  if (!item || typeof item !== "object" || typeof item.date !== "string") return false;
  let date = new Date(item.date + "T00:00:00Z");
  return typeof item.id === "string" && typeof item.description === "string" &&
    Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 &&
    typeof item.category === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === item.date;
}
let stored = readData(keys.transactions, []);
let transactions = Array.isArray(stored) && stored.every(validTransaction) ? stored : [];
let settings = readData(keys.settings, { ...defaults });
if (!settings || typeof settings !== "object" || Array.isArray(settings)) settings = { ...defaults };
function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (error) {
    console.error("Could not save data:", error);
    showStatus("Unable to save. Check your browser storage and try again.", true);
    return false;
  }
}
function showStatus(message, isError = false) {
  let box = get("settings-status") || get("form-status") || get("search-status");
  if (box) { box.textContent = message; box.classList.toggle("error", isError); }
}
