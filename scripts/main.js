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
function getRate(currency) {
  if (currency === "USD") return Number(settings.usdRate);
  if (currency === "EUR") return Number(settings.eurRate);
  return 1;
}
function formatMoney(amount) {
  let currency = settings.currency || "RWF", rate = getRate(currency);
  if (currency !== "RWF" && rate > 0) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount) / rate);
  }
  return new Intl.NumberFormat().format(Number(amount)) + " RWF";
}
function updateDashboard() {
  let total = transactions.reduce((sum, item) => sum + Number(item.amount), 0);
  if (get("stat-total")) get("stat-total").textContent = formatMoney(total);
  if (get("stat-count")) get("stat-count").textContent = transactions.length;
  let categoryTotals = {};
  transactions.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount);
  });
  let categories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
  if (get("stat-top-category")) get("stat-top-category").textContent = categories[0] || "None";

  let cap = Number(settings.spendingCap) || 0;
  if (get("budget-status")) get("budget-status").textContent =
    cap ? `${formatMoney(total)} spent of ${formatMoney(cap)}` : "No budget set";
  if (get("budget-progress")) get("budget-progress").style.width =
    cap ? `${Math.min(total / cap * 100, 100)}%` : "0%";

  let chart = get("chart-bars");
  if (!chart) return;
  chart.replaceChildren();
  let days = [];
  for (let i = 6; i >= 0; i--) {
    let date = new Date();
    date.setDate(date.getDate() - i);
    days.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
  }
  let amounts = days.map((day) => transactions
    .filter((item) => item.date === day)
    .reduce((sum, item) => sum + Number(item.amount), 0));
  let biggestDay = Math.max(...amounts, 1);
  amounts.forEach((amount, i) => {
    let bar = document.createElement("div");
    bar.className = "chart-bar"; bar.style.height = `${Math.max(amount / biggestDay * 100, 4)}%`;
    bar.title = `${days[i]}: ${formatMoney(amount)}`;
    bar.setAttribute("aria-label", bar.title); chart.append(bar);
  });
  if (settings.currency !== "RWF" && getRate(settings.currency) <= 0) {
    showStatus(`Add a valid ${settings.currency} exchange rate in Settings.`, true);
  }
}
