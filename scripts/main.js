const keys = { transactions: "studentFinanceTracker.transactions", settings: "studentFinanceTracker.settings", editing: "studentFinanceTracker.editingTransactionId" };
const defaults = { currency: "RWF", usdRate: "", eurRate: "", spendingCap: 0 };
const sampleRows = [
  ["Lunch at cafeteria", 3500, "food", "2026-06-19"],
  ["Chemistry textbook", 45000, "fees", "2026-06-18"],
  ["Ride to Kigali Heights", 1500, "transport", "2026-06-19"],
  ["Internet bundle", 10000, "others", "2026-06-15"],
  ["Groceries", 28500, "food", "2026-06-17"],
  ["Cinema ticket", 5000, "entertainment", "2026-06-13"]
];
const get = (id) => document.getElementById(id);

