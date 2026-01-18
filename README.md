# ClearPath Finance

A comprehensive personal finance dashboard built with React to help you understand cash flows, mortgages, investments, spending habits, and more.

![ClearPath Finance](https://via.placeholder.com/800x400?text=ClearPath+Finance+Dashboard)

## Features

### 📊 Dashboard
- Monthly income, expenses, and net cash flow overview
- Interactive cash flow trend charts
- Smart insights and savings recommendations

### 📄 Statement Upload
- Secure drag-and-drop file upload
- Support for PDF, CSV, OFX, and QFX files
- Automatic transaction analysis

### 💰 Cash Flow Analysis
- Income vs expenses visualization
- Spending by category breakdown
- Monthly trend tracking

### 🛒 Spending Habits
- Category-wise spending analysis
- Historical trend comparisons
- Pattern recognition insights

### 🔄 Subscription Tracker
- Monitor all recurring charges
- Identify unused subscriptions
- Find bundle savings opportunities

### 📈 Investment Analysis
- Portfolio growth visualization
- Asset allocation charts
- Account balance tracking

### 🏠 Mortgage & Home Equity Calculator
- Full PITI payment calculator
- Amortization schedule
- Equity growth projections

### 🚗 Vehicle Calculator
- Lease vs Finance vs Buy comparison
- Total cost of ownership analysis
- Side-by-side comparison

### 🎯 Retirement Planner
- Savings projections
- Income replacement calculations
- Progress tracking toward goals

### 💡 Savings Advice
- Personalized recommendations
- 50/30/20 budgeting framework
- Category-specific tips

---

## Getting Started

### Prerequisites

Make sure you have **Node.js** installed (version 18 or higher recommended).

Check your version:
```bash
node --version
```

If you don't have Node.js, download it from [nodejs.org](https://nodejs.org/)

### Installation

1. **Clone or download this repository**

2. **Navigate to the project folder**
   ```bash
   cd clearpath-finance
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   The app will automatically open at `http://localhost:3000`

---

## Project Structure

```
clearpath-finance/
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── README.md           # This file
└── src/
    ├── main.jsx        # React entry point
    └── App.jsx         # Main application component
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

---

## Building for Production

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `dist/` folder that you can deploy to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any web server

---

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Interactive charts
- **Lucide React** - Icon library

---

## Customization

### Changing Colors

The app uses CSS variables defined in the `<style>` section of `App.jsx`. Key variables:

```css
--bg-primary: #ffffff;      /* Main background */
--bg-secondary: #f8fafc;    /* Card backgrounds */
--text-primary: #0f172a;    /* Main text color */
--accent: #0f172a;          /* Accent/brand color */
--success: #10b981;         /* Positive indicators */
--warning: #f59e0b;         /* Warning indicators */
--danger: #ef4444;          /* Negative indicators */
```

### Adding New Sections

1. Add a new nav item to the `navItems` array
2. Create the section component
3. Add the conditional render in the main content area

---

## Security Note

This app processes financial data **entirely in your browser**. No data is sent to external servers. When you upload statements, they are analyzed locally using JavaScript.

---

## License

MIT License - feel free to use this for personal or commercial projects.

---

## Support

If you have questions or need help, feel free to open an issue or reach out!
