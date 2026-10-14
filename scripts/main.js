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
    typeof item.category === "string" && Validators.date.test(item.date) &&
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === item.date;
}
let stored = readData(keys.transactions, []);
let transactions = Array.isArray(stored) ? stored.filter(validTransaction) : [];
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

  if (settings.currency !== "RWF" && getRate(settings.currency) <= 0) {
    showStatus(`Add a valid ${settings.currency} exchange rate in Settings.`, true);
  }
}
function editTransaction(id) {
  try { sessionStorage.setItem(keys.editing, id); location.href = "add-expense.html"; }
  catch (error) { console.error("Could not start editing:", error); showStatus("Unable to start editing.", true); }
}
function deleteTransaction(id) {
  let item = transactions.find((transaction) => transaction.id === id);
  if (!item || !confirm(`Delete "${item.description}"?`)) return;
  let next = transactions.filter((transaction) => transaction.id !== id);
  if (saveData(keys.transactions, next)) { transactions = next; updatePage(); }
}
function compileRegex(input) {
  if (!input) return null;
  if (input.length > 100) return {error: "max 100 characters"};
  if (/\([^))]*[+*][^)]*\)[+*{]/.test(input)) return { error: "Too complex" };
  try{
    return { re: new RegExp(input, "i"), reG: new RegExp(input, "gi") };
  } catch (error) {
    return { error: "Invalid pattern: + error.message"};
  }
}

function highlightInto(cell, text, regex) {
  if (!regex) { cell.textContent = text; return; }
  let last = 0;
  for (const match of String(text).matchAll(regex)) {
    if (match[0] === "") continue;
    cell.append(document.createTextNode(text.slice(last, match.index)));
    let mark = document.createElement("mark");
    mark.textContent = match[0];
    cell.append(mark);
    last = match.index + match[0].length;
  }
  cell.append(document.createTextNode(text.slice(last)));
}

function sortRecords(records, sortValue) {
  let [field, dir] = sortValue.split("-");
  let factor = dir === "desc" ? -1 : 1;
  return [...records].sort((a,b) => {
    if (field === "amount") return (Number(a.amount) - Number(b.amount)) * factor;
    if (field === "date") return a.date.localeCompare(b.date) * factor;
    return a.description.localeCompare(b.description) * factor;
  });
}
function updateRecords() {
  let body = get("records-tbody");
  if (!body) return;
  let search = get("search-input"), sort = get("sort-select");
  let searchText = search ? search.value.trim() : "";
  let status = get("search-status");
  let matcher = compileRegex(searchText);
  if (matcher && matcher.error) {
    if (status) { status.textContent = matcher.error; status.classList.add("error"); }
    matcher = null;
  } else if (status) status.classList.remove("error");
  let sortBy = sort ? sort.value : "date-asc";
  let rows = transactions.filter((item) =>
    !matcher || matcher.re.test(`${item.description} ${item.category} ${item.date}`));
  rows = sortRecords(rows, sortBy);
  body.replaceChildren();
  if (status && matcher) status.textContent = `${rows.length} match${rows.length === 1 ? "" : "es"} found.`;
  else if (status && !searchText) status.textContent = "";
  if (!rows.length) {
    let cell = body.insertRow().insertCell();
    cell.colSpan = 5; cell.className = "empty-state";
    cell.textContent = searchText ? "No matching transactions." : "No transactions yet. Add one to get started!";
    return;
  }
  rows.forEach((item) => {
    let row = body.insertRow();
    [item.description, formatMoney(item.amount), item.category, item.date].forEach((value, i) => {
      let cell = row.insertCell();
      if (i === 1) cell.textContent = value;
      else highlightInto(cell, value, matcher && matcher.reG);
    });
    let actions = row.insertCell();
    [["Edit", () => editTransaction(item.id)], ["Delete", () => deleteTransaction(item.id)]].forEach(([name, action]) => {
      let button = document.createElement("button");
      button.type = "button"; button.className = "secondary"; button.textContent = name;
      button.addEventListener("click", action); actions.append(button, document.createTextNode(" "));
    });
  });
}
function updateCategories() {
  let list = get("cats");
  if (!list) return;
  let categories = [...new Set(transactions.map((item) => item.category))].sort();
  list.replaceChildren();
  categories.forEach((category) => {
    let option = document.createElement("option"); option.value = category; list.append(option);
  });
}
function updatePage() { updateDashboard(); updateRecords(); updateCategories(); }
function checkForm(form) {
  let values = {
    description: form.elements.description.value.trim(), amount: form.elements.amount.value.trim(),
    category: form.elements.category.value.trim(), date: form.elements.date.value
  };
  let rules = {
    description: [Validators.description.test(values.description) && !Validators.duplicateWord.test(values.description), "Enter a valid description."],
    amount: [Validators.amount.test(values.amount) && Number(values.amount) > 0, "Enter an amount above zero (up to 2 decimals)."],
    category: [Validators.category.test(values.category), "Use letters and spaces for the category."],
    date: [validTransaction({ ...values, id: "check" }), "Choose a valid date."]
  };
  let isValid = true;
  Object.keys(rules).forEach((field) => {
    let errorBox = get(field + "-error");
    if (errorBox) errorBox.textContent = rules[field][0] ? "" : rules[field][1];
    if (!rules[field][0]) isValid = false;
  });
  if (!isValid) return null;
  values.amount = Number(values.amount);
  return values;
}
function setupExpenseForm() {
  let form = get("tx-form");
  if (!form) return;
  let idInput = get("transaction-id"), editingId = sessionStorage.getItem(keys.editing);
  let existing = transactions.find((item) => item.id === editingId);
  if (existing) {
    ["description", "amount", "category", "date"].forEach((field) => { form.elements[field].value = existing[field]; });
    idInput.value = existing.id; get("form-h").textContent = "Edit Transaction";
  } else if (editingId) sessionStorage.removeItem(keys.editing);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let values = checkForm(form);
    if (!values) return;
    let old = transactions.find((item) => item.id === idInput.value);
    let now = new Date().toISOString(), next;
    if (old) {
      next = transactions.map((item) => item.id === old.id ? { ...item, ...values, updatedAt: now } : item);
    } else {
      values.id = globalThis.crypto?.randomUUID?.() || `txn_${Date.now()}`;
      values.createdAt = now; values.updatedAt = now;
      next = [...transactions, values];
    }
    if (!saveData(keys.transactions, next)) return;
    transactions = next; sessionStorage.removeItem(keys.editing);
    showStatus(old ? "Transaction updated." : "Transaction saved.");
    form.reset(); idInput.value = ""; updatePage();
  });
  let cancel = get("cancel-btn");
  if (cancel) cancel.addEventListener("click", () => {
    sessionStorage.removeItem(keys.editing); location.href = "index.html";
  });
}
function exportTransactions() {
  let file = new Blob([JSON.stringify(transactions, null, 2)], { type: "application/json" });
  let url = URL.createObjectURL(file), link = document.createElement("a");
  link.href = url; link.download = "student-finance-transactions.json"; link.click(); URL.revokeObjectURL(url);
  showStatus("Transactions exported.");
}
function checkImport(data) {
  if (!Array.isArray(data)) return "file must contain a json array";
  if (data.lenght > 5000) return "too many records max is 5000";
  let ids = new Set();
  for (let i = 0; i < data.length; i++) {
    let item = data[i], n = i + 1;
    if (!validTransaction(item)) return `Record ${n} has a missing or invalid filed`;
    if (!Validators.description.test(item.description)) return `Record ${n}: invalid description`;
    if (!Validators.category.test(item.category)) return `Record ${n}: invalid category`;
    if (ids.has(item.id)) return `Record ${n}: duplicate id`;
    ids.add(item.id);
  }
  return "";
}
async function importTransactions(event) {
  let input = event.currentTarget;
  if (!input.files || !input.files[0]) return;
  let file = input.files[0];
  try {
    if (!file.name.toLowerCase().endsWith(".json")) throw new Error("Choose a .json file");
    if (file.size > 1000000) throw new Error("file is too large mx is 1 MB");
    let imported = JSON.parse(await file.text());
    let problem = checkImport(imported);
    if (problem) throw new Error(problem);
    if (!confirm(`Replace your ${transaction.length} transaction with ${imported.length} imported records?`)){
      input.value = ""; return;
    }
    if (saveData(keys.transactions, imported)) { transactions = imported; showStatus("Transactions imported."); updatePage(); }
  } catch (error) {
    console.error("Could not import the selected file:", error); showStatus(`Import failed: ${error.message}`, true);
  }
  input.value = "";
}
function setupSettings() {
  let currency = get("display-currency");
  if (!currency) return;
  currency.value = settings.currency || "RWF";
  get("rate-usd").value = settings.usdRate || ""; get("rate-eur").value = settings.eurRate || "";
  get("cap").value = settings.spendingCap || 0;
  get("save-settings").addEventListener("click", () => {
    let nextSettings = {
      currency: currency.value, usdRate: get("rate-usd").value,
      eurRate: get("rate-eur").value, spendingCap: Number(get("cap").value)
    };
    let rate = nextSettings.currency === "USD" ? Number(nextSettings.usdRate)
      : nextSettings.currency === "EUR" ? Number(nextSettings.eurRate) : 1;
    if (!Number.isFinite(nextSettings.spendingCap) || nextSettings.spendingCap < 0 ||
        (nextSettings.currency !== "RWF" && rate <= 0)) {
      showStatus("Enter a non-negative cap and a positive rate for the selected currency.", true); return;
    }
    if (saveData(keys.settings, nextSettings)) {
      settings = nextSettings; showStatus("Settings saved."); updatePage();
    }
  });
  get("export-btn").addEventListener("click", exportTransactions);
  get("load-sample-btn").addEventListener("click", () => {
    if (!confirm("Replace your transactions with sample data?")) return;
    let now = new Date().toISOString();
    let sampleTransactions = sampleRows.map(([description, amount, category, date], index) => ({
      id: `sample_${index + 1}`, description, amount, category, date,createdAt: now, updatedAT: now
    }));
    if (saveData(keys.transactions, sampleTransactions)) {
      transactions = sampleTransactions; showStatus("Sample transactions loaded."); updatePage();
    }
  });
  get("import-file").addEventListener("change", importTransactions);
}

document.addEventListener("DOMContentLoaded", () => {
  updatePage(); setupExpenseForm(); setupSettings();
  if (get("search-input")) get("search-input").addEventListener("input", updateRecords);
  if (get("sort-select")) get("sort-select").addEventListener("change", updateRecords);
});

