# Student Finance Tracker

## Overview

A responsive, accessible multi-page web app that helps students record daily expenses, categorize spending, and stay within a personal budget. Built with plain HTML, CSS, and JavaScript, with no frameworks and no build tools.

Built for the ALU summative assignment

## Live Demo

🌐 https://david-aurel-lenoir.github.io/Student_Finance_Tracker_Summative/

## Demo Video

🎥 https://youtu.be/45Yv2blx8DI

## Repository

📁https://github.com/david-aurel-lenoir/Student_Finance_Tracker_Summative.git

## Chosen Theme

**Theme 1: Student Finance Tracker**

## Project Structure

```
Student_Finance_Tracker_Summative/
├── index.html          # Dashboard
├── add-expense.html    # Add / edit a transaction
├── records.html        # Search, sort, edit, delete
├── settings.html       # Currency, spending cap, import/export
├── about.html          # About the project and contact
├── test.html           # Regex validation tests
├── seed.json           # Sample data (10+ records)
├── scripts/            # JavaScript
├── styles/             # CSS
└── assets/             # Images and other assets
```

## Features

- Add, edit, and delete transactions (description, amount, category, date)
- Form validation with regex and inline error messages
- Live regex search on the Records page with a results status message
- Sort records by date, description, or amount
- Dashboard with total expenses, number of expenses, top category, and a last-7-days spending chart
- Budget indicator: set a spending cap and see progress with a progress bar and status message (announced politely to screen readers)
- Currency settings: display in RWF (base), USD, or EUR using manual exchange rates
- Export and import data as JSON
- Load sample data from `seed.json` in one click
- Data saved in the browser so records persist between sessions
- Mobile-first responsive layout
- Keyboard navigation 

## Regex Catalog

| Field | Pattern | Purpose | Valid example | Invalid example |
| --- | --- | --- | --- | --- |
| Description | `/^\S(?:.*\S)?$/` | No leading or trailing spaces | `Lunch at cafeteria` | ` Lunch` |
| Amount | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | Positive number, up to 2 decimals | `12.50` | `12.505` |
| Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | Format `YYYY-MM-DD` | `2026-10-15` | `2026-13-40` |
| Category | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Letters, spaces, and hyphens only | `Self-Care` | `Food123` |
| Duplicate word | `/\b(\w+)\s+\1\b/i` | Advanced: back-reference catches repeated words | _(flagged)_ `coffee coffee` | `Lunch at cafeteria` |

## Keyboard Map

| Key | Action |
| --- | --- |
| `Tab` | Move to the next focusable element |
| `Enter` | Submit the form, press a button, or follow a link |
| `Shift` + `Tab` | Move to the previous focusable element |

## Accessibility Notes

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Skip-to-content link as the first focusable element
- Every form input has a bound `<label>`
- Inline errors use `role="alert"`; status messages use `role="status"` with `aria-live="polite"` (search results, budget status, form and settings messages)
- Visible focus outline on all interactive elements
- Heading order: `h1` → `h2` → `h3`

## How to Run Tests

1. Open `test.html` in any modern browser (double-click it, or use the VS Code Live Server extension).
2. Each test prints a line: **green = Passed**, **red = Failed**.
3. The tests check the regex patterns above with valid and invalid inputs.

## Setup

1. Clone the repo:
   ```
   git clone https://github.com/david-aurel-lenoir/Student_Finance_Tracker_Summative.git
   ```
2. Open `index.html` in a browser.
3. No installation or build step is needed.
4. Optional: go to **Settings → Load sample data** to fill the app with the records from `seed.json`.

## Data Format (JSON import/export)

```json
{
  "id": "txn_001",
  "description": "Lunch at cafeteria",
  "amount": 2500,
  "category": "Food",
  "date": "2026-10-10"
}
```

## Author

**David Aurelien Bitwayiki**
ALU, October 2026
📧 aureldavidbutare@gmail.com