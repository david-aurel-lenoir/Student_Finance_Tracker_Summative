const keys = { transactions: "studentFinanceTracker.transactions", settings: "studentFinanceTracker.settings", editing: "studentFinanceTracker.editingTransactionId" };
const defaults = { currency: "RWF", usdRate: "", eurRate: "", spendingCap: 0 };
const sampleRows = [
  ["Lunch", 3500, "food", "2026-06-19"],
  ["book", 45000, "fees", "2026-06-18"],
];
const get = (id) => document.getElementById(id);

function readData(key, backup) {}