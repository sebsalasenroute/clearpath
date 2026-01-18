# ClearPath Finance

A personal finance dashboard that stores all your data locally in your browser. No accounts, no servers, complete privacy.

## Features

### 📊 Dashboard
- Track monthly income, expenses, and net cash flow
- Spending breakdown by category (pie chart)
- Quick access to all tools

### 💳 Transactions
- Add income and expenses
- Categorize spending (Housing, Groceries, Dining, etc.)
- Edit or delete any transaction
- All data saved automatically

### 🔄 Subscriptions
- Track recurring charges (Netflix, Spotify, etc.)
- See monthly and yearly totals
- Identify subscriptions to cancel

### 🏠 Mortgage Calculator
- Calculate monthly payments (PITI)
- See total interest over loan life
- Adjust down payment, rate, term

### 🚗 Vehicle Calculator
- Compare Buy vs Finance vs Lease
- See which option costs less
- Factor in resale value

### 🎯 Retirement Planner
- Project future savings
- Calculate safe withdrawal rate
- Track progress toward goal

---

## Quick Start

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) (version 18+)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the App
```bash
npm run dev
```

### 4. Open Browser
Go to `http://localhost:3000`

---

## Deploy to Vercel (Free Hosting)

### 1. Push to GitHub
- Create a new repo on [github.com](https://github.com)
- Upload all files (drag & drop works)

### 2. Connect to Vercel
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Import your repo
- Click Deploy

Your app will be live at `https://your-project.vercel.app`

---

## How Data Storage Works

**All data stays in your browser** using localStorage:

| Data | Storage Key |
|------|-------------|
| User profile | `clearpath_user` |
| Transactions | `clearpath_transactions` |
| Subscriptions | `clearpath_subscriptions` |

### Privacy
- ✅ Data never leaves your device
- ✅ No accounts or sign-ups
- ✅ No tracking or analytics
- ✅ Works offline after first load

### Limitations
- Data is per-browser (won't sync between devices)
- Clearing browser data will delete your info
- Use the Export feature to backup your data

---

## Project Structure

```
clearpath-finance/
├── index.html      # HTML entry point
├── main.jsx        # React entry
├── App.jsx         # Main app (all components)
├── package.json    # Dependencies
├── vite.config.js  # Build config
└── .gitignore      # Git ignore rules
```

---

## Available Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Customization

### Adding Categories
In `App.jsx`, find the `expenseCategories` array and add your own:

```javascript
const expenseCategories = [
  'Housing', 'Transportation', 'Groceries', // ... etc
  'Your New Category',  // Add here
];
```

### Changing Colors
Find the `:root` CSS variables in the styles section:

```css
--accent: #0f172a;      /* Main brand color */
--success: #10b981;     /* Green (positive) */
--danger: #ef4444;      /* Red (negative) */
```

---

## Backup & Restore

### Export Data
Settings → Export Data → Downloads a JSON file

### Restore Data (Manual)
Open browser console and run:
```javascript
const backup = { /* paste your JSON here */ };
localStorage.setItem('clearpath_user', JSON.stringify(backup.userData));
localStorage.setItem('clearpath_transactions', JSON.stringify(backup.transactions));
localStorage.setItem('clearpath_subscriptions', JSON.stringify(backup.subscriptions));
location.reload();
```

---

## License

MIT - Use freely for personal or commercial projects.
