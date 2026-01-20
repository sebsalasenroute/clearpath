import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Upload, TrendingUp, ShoppingCart, RefreshCw, PieChart as PieIcon, Key, Car, Target, Menu, X, ChevronRight, DollarSign, Percent, Calendar, ArrowUpRight, ArrowDownRight, Plus, FileText, CreditCard, Building, Check, AlertTriangle, Calculator, Wallet, PiggyBank, TrendingDown, Activity, Trash2, Edit2, Save, User, Settings, Download, RotateCcw, CheckCircle, XCircle, HelpCircle, FileSpreadsheet } from 'lucide-react';

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Parse various date formats
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = dateStr.toString().trim();
  
  // MM/DD/YYYY
  let match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // YYYY-MM-DD
  match = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // MM/DD/YY
  match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (match) {
    const [, month, day, year] = match;
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return null;
};

// Parse amount
const parseAmount = (amountStr) => {
  if (amountStr === null || amountStr === undefined || amountStr === '') return null;
  if (typeof amountStr === 'number') return amountStr;
  
  let cleaned = amountStr.toString().trim();
  if (!cleaned) return null;
  
  const isNegative = cleaned.startsWith('-') || /^\(.*\)$/.test(cleaned);
  cleaned = cleaned.replace(/[$,\s()-]/g, '');
  
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return null;
  
  return isNegative ? -Math.abs(amount) : amount;
};

// Smart category detection
const detectCategory = (description) => {
  if (!description) return 'Other';
  const desc = description.toLowerCase();
  
  const patterns = {
    'Software & SaaS': /slack|google|gsuite|openai|chatgpt|claude|windsurf|make\.com|shopify|mailgun|capture one|artiphoria|msft|microsoft|amazon web services|aws/i,
    'Shipping': /swyftcourier|ups|fedex|canada post|cpc |shippo|purolator/i,
    'Office & Supplies': /staples|office|indigo|juke box print/i,
    'Food & Beverage': /dean.*milk|dairy|coffee|cafe|restaurant|food/i,
    'Utilities & Telecom': /telus|rogers|bell|shaw|internet|phone/i,
    'Transportation': /paybyphone|parking|gas|fuel|uber|lyft|transit/i,
    'Professional Services': /indeed|transunion|biomedical|nova /i,
    'Inventory & Supplies': /costco|shimano|cycles lambert|luxottica/i,
    'Storage': /storguard|storage/i,
    'Entertainment': /spotify|netflix|disney/i,
    'Fees & Fines': /bylaw|fine|fee/i,
    'Payment Received': /payment.*thank|deposit|transfer in/i,
  };
  
  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(desc)) return category;
  }
  
  return 'Other';
};

// ============================================
// CSV PARSER - HANDLES HEADERLESS FILES
// ============================================
const parseCSV = (text) => {
  const lines = text.split(/\r\n|\r|\n/).filter(line => line.trim());
  if (lines.length === 0) return { rows: [], hasHeaders: false };
  
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };
  
  const rows = lines.map(line => parseLine(line));
  
  // Check if first row looks like headers or data
  const firstRow = rows[0];
  const firstCellIsDate = parseDate(firstRow[0]) !== null;
  const hasHeaders = !firstCellIsDate;
  
  return { 
    headers: hasHeaders ? firstRow : null,
    rows: hasHeaders ? rows.slice(1) : rows,
    hasHeaders 
  };
};

// Detect column structure
const detectColumns = (rows) => {
  if (rows.length === 0) return null;
  
  const firstRow = rows[0];
  const numCols = firstRow.length;
  
  // Common patterns:
  // 5 cols: Date, Description, Debit, Credit, Balance (your format)
  // 4 cols: Date, Description, Amount, Balance
  // 3 cols: Date, Description, Amount
  
  const mapping = { dateCol: -1, descCol: -1, debitCol: -1, creditCol: -1, amountCol: -1 };
  
  // Find date column (usually first)
  for (let i = 0; i < numCols; i++) {
    if (parseDate(firstRow[i])) {
      mapping.dateCol = i;
      break;
    }
  }
  
  // For 5-column format: Date, Desc, Debit, Credit, Balance
  if (numCols === 5) {
    mapping.descCol = 1;
    mapping.debitCol = 2;
    mapping.creditCol = 3;
    // Column 4 is balance, we don't need it
  }
  // For 4-column format: Date, Desc, Amount, Balance
  else if (numCols === 4) {
    mapping.descCol = 1;
    mapping.amountCol = 2;
  }
  // For 3-column format: Date, Desc, Amount
  else if (numCols === 3) {
    mapping.descCol = 1;
    mapping.amountCol = 2;
  }
  // Otherwise try to detect
  else {
    // Description is usually the longest text column
    let maxLen = 0;
    for (let i = 0; i < numCols; i++) {
      if (i === mapping.dateCol) continue;
      const avgLen = rows.slice(0, 5).reduce((sum, row) => sum + (row[i]?.length || 0), 0) / 5;
      if (avgLen > maxLen && isNaN(parseFloat(rows[0][i]?.replace(/[$,]/g, '')))) {
        maxLen = avgLen;
        mapping.descCol = i;
      }
    }
    
    // Find amount column
    for (let i = 0; i < numCols; i++) {
      if (i === mapping.dateCol || i === mapping.descCol) continue;
      if (parseAmount(firstRow[i]) !== null) {
        mapping.amountCol = i;
        break;
      }
    }
  }
  
  return mapping;
};

// ============================================
// LOCAL STORAGE
// ============================================
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

// ============================================
// DEFAULT DATA
// ============================================
const defaultUserData = { name: '', setupComplete: false, monthlyIncome: 0 };
const defaultTransactions = [];
const defaultSubscriptions = [];

const expenseCategories = [
  'Software & SaaS', 'Shipping', 'Office & Supplies', 'Food & Beverage',
  'Utilities & Telecom', 'Transportation', 'Professional Services',
  'Inventory & Supplies', 'Storage', 'Entertainment', 'Fees & Fines',
  'Payment Received', 'Housing', 'Insurance', 'Healthcare', 'Other'
];

// ============================================
// COMPONENTS
// ============================================

// Statement Upload with Fixed Parser
const StatementUpload = ({ onImport, existingCount }) => {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [debugInfo, setDebugInfo] = useState(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    setError(null);
    setDebugInfo(null);
    setParsedTransactions([]);
    setParsing(true);
    
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      setError('PDF files cannot be parsed. Please export your statement as CSV from your bank.');
      setParsing(false);
      return;
    }
    
    try {
      const text = await file.text();
      const { rows, hasHeaders } = parseCSV(text);
      
      const debug = {
        fileName,
        totalRows: rows.length,
        hasHeaders,
        sampleRow: rows[0],
        columnCount: rows[0]?.length
      };
      
      if (rows.length === 0) {
        setError('No data rows found in the file.');
        setDebugInfo(debug);
        setParsing(false);
        return;
      }
      
      const mapping = detectColumns(rows);
      debug.mapping = mapping;
      
      // Parse transactions
      const transactions = [];
      
      for (const row of rows) {
        let amount = 0;
        let type = 'expense';
        
        // Handle separate debit/credit columns
        if (mapping.debitCol !== -1 && mapping.creditCol !== -1) {
          const debit = parseAmount(row[mapping.debitCol]);
          const credit = parseAmount(row[mapping.creditCol]);
          
          if (credit !== null && credit > 0) {
            amount = credit;
            type = 'income';
          } else if (debit !== null && debit > 0) {
            amount = debit;
            type = 'expense';
          } else {
            continue; // Skip rows with no amount
          }
        }
        // Handle single amount column
        else if (mapping.amountCol !== -1) {
          const rawAmount = parseAmount(row[mapping.amountCol]);
          if (rawAmount === null) continue;
          
          amount = Math.abs(rawAmount);
          type = rawAmount < 0 ? 'expense' : 'income';
        }
        else {
          continue;
        }
        
        if (amount < 0.01) continue;
        
        const description = row[mapping.descCol] || 'Unknown';
        const date = parseDate(row[mapping.dateCol]) || new Date().toISOString().split('T')[0];
        
        transactions.push({
          id: generateId(),
          date,
          description,
          amount,
          type,
          category: detectCategory(description),
        });
      }
      
      debug.parsedCount = transactions.length;
      setDebugInfo(debug);
      
      if (transactions.length === 0) {
        setError('Could not parse any transactions. Check the debug info below.');
        setParsing(false);
        return;
      }
      
      // Sort by date descending
      transactions.sort((a, b) => b.date.localeCompare(a.date));
      
      setParsedTransactions(transactions);
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    
    setParsing(false);
  };

  const handleImport = () => {
    const toImport = parsedTransactions.filter(t => selectedTransactions.has(t.id));
    onImport(toImport);
    setParsedTransactions([]);
    setSelectedTransactions(new Set());
  };

  const toggleTransaction = (id) => {
    setSelectedTransactions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedTransactions.size === parsedTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(parsedTransactions.map(t => t.id)));
    }
  };

  const updateCategory = (id, category) => {
    setParsedTransactions(prev => prev.map(t => t.id === id ? { ...t, category } : t));
  };

  const incomeTotal = parsedTransactions.filter(t => selectedTransactions.has(t.id) && t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenseTotal = parsedTransactions.filter(t => selectedTransactions.has(t.id) && t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="upload-section">
      {existingCount > 0 && (
        <div className="notice info">
          <CheckCircle size={18} />
          You have {existingCount} existing transactions. New imports will be added.
        </div>
      )}
      
      {parsedTransactions.length === 0 && (
        <>
          <div className="upload-zone" 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              type="file"
              id="file-input"
              accept=".csv,.txt,.ofx,.qfx"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            
            {parsing ? (
              <>
                <div className="spinner"></div>
                <h3>Analyzing file...</h3>
              </>
            ) : (
              <>
                <div className="upload-icon"><FileSpreadsheet size={32} /></div>
                <h3>Drop your bank statement here</h3>
                <p>or click to browse • CSV, TXT, OFX, QFX</p>
              </>
            )}
          </div>

          {error && (
            <div className="notice error">
              <XCircle size={18} />
              <div>
                <strong>Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {debugInfo && (
            <details className="debug-panel">
              <summary>Debug Info (click to expand)</summary>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          )}

          <div className="tips">
            <h4>Supported Formats:</h4>
            <ul>
              <li><strong>With headers:</strong> Date, Description, Amount</li>
              <li><strong>Without headers:</strong> Date, Description, Debit, Credit, Balance (your bank's format ✓)</li>
            </ul>
          </div>
        </>
      )}

      {parsedTransactions.length > 0 && (
        <div className="preview-panel">
          <div className="preview-header">
            <div>
              <h3><CheckCircle size={20} /> Found {parsedTransactions.length} transactions</h3>
              <p>Review and select which to import</p>
            </div>
            <button className="btn secondary" onClick={() => setParsedTransactions([])}>
              <X size={16} /> Cancel
            </button>
          </div>

          <div className="preview-toolbar">
            <label>
              <input
                type="checkbox"
                checked={selectedTransactions.size === parsedTransactions.length}
                onChange={toggleAll}
              />
              Select all ({selectedTransactions.size} selected)
            </label>
          </div>

          <div className="preview-list">
            {parsedTransactions.map(t => (
              <div key={t.id} className={`preview-item ${selectedTransactions.has(t.id) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedTransactions.has(t.id)}
                  onChange={() => toggleTransaction(t.id)}
                />
                <span className="date">{t.date}</span>
                <span className="desc" title={t.description}>{t.description}</span>
                <select value={t.category} onChange={(e) => updateCategory(t.id, e.target.value)}>
                  {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className={`amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="preview-footer">
            <div className="summary">
              <span>Income: <strong className="income">+{formatCurrency(incomeTotal)}</strong></span>
              <span>Expenses: <strong className="expense">-{formatCurrency(expenseTotal)}</strong></span>
              <span>Net: <strong className={incomeTotal - expenseTotal >= 0 ? 'income' : 'expense'}>
                {formatCurrency(incomeTotal - expenseTotal)}
              </strong></span>
            </div>
            <button className="btn primary" onClick={handleImport} disabled={selectedTransactions.size === 0}>
              <Download size={16} /> Import {selectedTransactions.size} Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Setup Wizard
const SetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: '', monthlyIncome: '' });

  return (
    <div className="setup-wizard">
      <div className="setup-card">
        <h1>Welcome to ClearPath Finance</h1>
        <p>Let's get you set up</p>

        {step === 1 && (
          <div className="setup-step">
            <h2>What's your name?</h2>
            <input
              type="text"
              placeholder="Your name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              autoFocus
            />
            <button className="btn primary" onClick={() => setStep(2)} disabled={!data.name.trim()}>
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <h2>Monthly income? (optional)</h2>
            <div className="input-with-icon">
              <DollarSign size={20} />
              <input
                type="number"
                placeholder="5000"
                value={data.monthlyIncome}
                onChange={(e) => setData({ ...data, monthlyIncome: e.target.value })}
              />
            </div>
            <div className="btn-row">
              <button className="btn secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn primary" onClick={() => onComplete({ ...data, monthlyIncome: parseFloat(data.monthlyIncome) || 0, setupComplete: true })}>
                Get Started <Check size={18} />
              </button>
            </div>
          </div>
        )}

        <button className="skip" onClick={() => onComplete({ name: '', monthlyIncome: 0, setupComplete: true })}>
          Skip setup
        </button>
      </div>
    </div>
  );
};

// Stat Card
const StatCard = ({ title, value, icon: Icon, subtitle, trend, onClick }) => (
  <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div className="stat-header">
      <div className="stat-icon"><Icon size={20} /></div>
      {trend && <div className={`trend ${trend}`}>{trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</div>}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
    {subtitle && <div className="stat-subtitle">{subtitle}</div>}
  </div>
);

// Empty State
const EmptyState = ({ icon: Icon, title, description, action, onAction }) => (
  <div className="empty-state">
    <div className="empty-icon"><Icon size={32} /></div>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && <button className="btn primary" onClick={onAction}><Plus size={16} /> {action}</button>}
  </div>
);

// Transaction Modal
const TransactionModal = ({ isOpen, onClose, onSave, transaction }) => {
  const [form, setForm] = useState({
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Other',
    type: 'expense',
  });

  useEffect(() => {
    if (transaction) setForm(transaction);
    else setForm({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'Other',
      type: 'expense',
    });
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{transaction ? 'Edit' : 'Add'} Transaction</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, amount: parseFloat(form.amount) }); onClose(); }}>
          <div className="form-group">
            <label>Type</label>
            <div className="toggle-group">
              <button type="button" className={form.type === 'expense' ? 'active' : ''} onClick={() => setForm({ ...form, type: 'expense' })}>Expense</button>
              <button type="button" className={form.type === 'income' ? 'active' : ''} onClick={() => setForm({ ...form, type: 'income' })}>Income</button>
            </div>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary"><Save size={16} /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function ClearPathFinance() {
  const [userData, setUserData] = useLocalStorage('clearpath_user', defaultUserData);
  const [transactions, setTransactions] = useLocalStorage('clearpath_transactions', defaultTransactions);
  const [subscriptions, setSubscriptions] = useLocalStorage('clearpath_subscriptions', defaultSubscriptions);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthlyData = useMemo(() => {
    const thisMonth = transactions.filter(t => t.date?.startsWith(currentMonth));
    const expenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0) || userData.monthlyIncome;
    return { income, expenses, netCashFlow: income - expenses };
  }, [transactions, userData.monthlyIncome, currentMonth]);

  const expensesByCategory = useMemo(() => {
    const thisMonth = transactions.filter(t => t.date?.startsWith(currentMonth) && t.type === 'expense');
    const grouped = {};
    thisMonth.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth]);

  const chartColors = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

  const handleImportTransactions = (newTxns) => {
    setTransactions(prev => [...prev, ...newTxns]);
    setImportSuccess(`Imported ${newTxns.length} transactions!`);
    setTimeout(() => setImportSuccess(null), 4000);
    setActiveSection('transactions');
  };

  const handleSaveTransaction = (txn) => {
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === txn.id ? txn : t));
    } else {
      setTransactions([...transactions, txn]);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleExportData = () => {
    const data = { userData, transactions, subscriptions, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `clearpath-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleResetData = () => {
    if (confirm('Delete ALL data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!userData.setupComplete) {
    return <><style>{styles}</style><SetupWizard onComplete={setUserData} /></>;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Import Statement', icon: Upload },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, badge: transactions.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="logo">
            <h1>ClearPath</h1>
            <span>Finance</span>
          </div>
          <div className="greeting"><User size={18} /> Hi, {userData.name || 'there'}!</div>
          <ul className="nav-list">
            {navItems.map(item => (
              <li key={item.id}>
                <button className={`nav-link ${activeSection === item.id ? 'active' : ''}`} onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}>
                  <item.icon size={18} /> {item.label}
                  {item.badge > 0 && <span className="badge">{item.badge}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button className="mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <main className="main">
          {importSuccess && <div className="toast success"><CheckCircle size={18} /> {importSuccess}</div>}

          {activeSection === 'dashboard' && (
            <>
              <header className="page-header">
                <h2>Dashboard</h2>
                <p>{transactions.length} transactions</p>
              </header>

              <div className="stats-grid">
                <StatCard title="Income" value={formatCurrency(monthlyData.income)} icon={TrendingUp} />
                <StatCard title="Expenses" value={formatCurrency(monthlyData.expenses)} icon={ShoppingCart} />
                <StatCard title="Net" value={formatCurrency(monthlyData.netCashFlow)} icon={DollarSign} trend={monthlyData.netCashFlow >= 0 ? 'up' : 'down'} />
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3>Spending by Category</h3>
                  {expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {expensesByCategory.map((e, i) => <Cell key={e.name} fill={chartColors[i % chartColors.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState icon={PieIcon} title="No data" description="Import transactions to see spending" action="Import" onAction={() => setActiveSection('upload')} />
                  )}
                </div>

                <div className="card">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button onClick={() => setActiveSection('upload')}><Upload size={18} /> Import Statement</button>
                    <button onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}><Plus size={18} /> Add Transaction</button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Recent Transactions</h3>
                  <button className="btn small" onClick={() => setActiveSection('transactions')}>View All</button>
                </div>
                {transactions.length > 0 ? (
                  <div className="txn-list">
                    {transactions.slice(-8).reverse().map(t => (
                      <div key={t.id} className="txn-item">
                        <div className="txn-info">
                          <span className="txn-desc">{t.description}</span>
                          <span className="txn-meta">{t.category} • {t.date}</span>
                        </div>
                        <span className={`txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={CreditCard} title="No transactions" description="Import a statement to get started" action="Import" onAction={() => setActiveSection('upload')} />
                )}
              </div>
            </>
          )}

          {activeSection === 'upload' && (
            <>
              <header className="page-header">
                <h2>Import Statement</h2>
                <p>Upload your bank statement (CSV format)</p>
              </header>
              <StatementUpload onImport={handleImportTransactions} existingCount={transactions.length} />
            </>
          )}

          {activeSection === 'transactions' && (
            <>
              <header className="page-header">
                <div>
                  <h2>Transactions</h2>
                  <p>{transactions.length} total</p>
                </div>
                <div className="header-actions">
                  <button className="btn secondary" onClick={() => setActiveSection('upload')}><Upload size={16} /> Import</button>
                  <button className="btn primary" onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}><Plus size={16} /> Add</button>
                </div>
              </header>

              {transactions.length > 0 ? (
                <div className="card">
                  <div className="txn-list">
                    {[...transactions].sort((a, b) => b.date.localeCompare(a.date)).map(t => (
                      <div key={t.id} className="txn-item">
                        <div className="txn-info">
                          <span className="txn-desc">{t.description}</span>
                          <span className="txn-meta">{t.category} • {t.date}</span>
                        </div>
                        <div className="txn-actions">
                          <span className={`txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                          <button className="icon-btn" onClick={() => { setEditingTransaction(t); setShowTransactionModal(true); }}><Edit2 size={16} /></button>
                          <button className="icon-btn danger" onClick={() => handleDeleteTransaction(t.id)}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <EmptyState icon={CreditCard} title="No transactions" description="Import a statement" action="Import" onAction={() => setActiveSection('upload')} />
                </div>
              )}
            </>
          )}

          {activeSection === 'settings' && (
            <>
              <header className="page-header"><h2>Settings</h2></header>
              <div className="card">
                <h3>Data ({transactions.length} transactions)</h3>
                <div className="settings-row">
                  <div><strong>Export Backup</strong><p>Download all data as JSON</p></div>
                  <button className="btn small" onClick={handleExportData}><Download size={14} /> Export</button>
                </div>
                <div className="settings-row">
                  <div><strong>Reset Data</strong><p>Delete everything</p></div>
                  <button className="btn small danger" onClick={handleResetData}><RotateCcw size={14} /> Reset</button>
                </div>
              </div>
            </>
          )}
        </main>

        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
          onSave={handleSaveTransaction}
          transaction={editingTransaction}
        />
      </div>
    </>
  );
}

// ============================================
// STYLES
// ============================================
const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #fff; --bg2: #f8fafc; --bg3: #f1f5f9;
  --border: #e2e8f0; --border2: #cbd5e1;
  --text: #0f172a; --text2: #475569; --muted: #94a3b8;
  --accent: #0f172a;
  --success: #10b981; --success-bg: #ecfdf5;
  --danger: #ef4444; --danger-bg: #fef2f2;
  --info: #3b82f6; --info-bg: #eff6ff;
  --radius: 12px; --radius-sm: 8px;
}
body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); }
.app { display: flex; min-height: 100vh; }

/* Setup */
.setup-wizard { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 20px; }
.setup-card { background: #fff; border-radius: 20px; padding: 48px; max-width: 420px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.1); text-align: center; }
.setup-card h1 { font-size: 1.5rem; margin-bottom: 8px; }
.setup-card > p { color: var(--text2); margin-bottom: 32px; }
.setup-step h2 { font-size: 1.125rem; margin-bottom: 16px; }
.setup-step input { width: 100%; padding: 14px; font-size: 1rem; border: 2px solid var(--border); border-radius: var(--radius); margin-bottom: 20px; outline: none; text-align: center; }
.setup-step input:focus { border-color: var(--accent); }
.input-with-icon { display: flex; align-items: center; border: 2px solid var(--border); border-radius: var(--radius); padding: 0 14px; margin-bottom: 20px; }
.input-with-icon:focus-within { border-color: var(--accent); }
.input-with-icon input { flex: 1; border: none; padding: 14px 0; text-align: center; outline: none; font-size: 1rem; }
.btn-row { display: flex; gap: 12px; justify-content: center; }
.skip { background: none; border: none; color: var(--muted); margin-top: 24px; cursor: pointer; }

/* Sidebar */
.sidebar { width: 240px; background: var(--bg2); border-right: 1px solid var(--border); padding: 20px 0; position: fixed; height: 100vh; z-index: 100; transition: transform 0.3s; }
.logo { padding: 0 20px 16px; border-bottom: 1px solid var(--border); }
.logo h1 { font-size: 1.25rem; }
.logo span { font-size: 0.75rem; color: var(--muted); }
.greeting { display: flex; align-items: center; gap: 8px; padding: 12px 20px; color: var(--text2); font-size: 0.875rem; border-bottom: 1px solid var(--border); }
.nav-list { list-style: none; padding: 12px 8px; }
.nav-link { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: none; background: none; border-radius: var(--radius-sm); color: var(--text2); font-size: 0.875rem; cursor: pointer; text-align: left; }
.nav-link:hover { background: var(--bg3); color: var(--text); }
.nav-link.active { background: var(--accent); color: #fff; }
.badge { margin-left: auto; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 100px; font-size: 0.7rem; }

/* Main */
.main { flex: 1; margin-left: 240px; padding: 24px 32px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h2 { font-size: 1.5rem; margin-bottom: 4px; }
.page-header p { color: var(--text2); font-size: 0.875rem; }
.header-actions { display: flex; gap: 10px; }

/* Toast */
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 20px; font-weight: 500; }
.toast.success { background: var(--success-bg); color: #166534; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
.stat-card.clickable { cursor: pointer; }
.stat-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.stat-icon { width: 36px; height: 36px; background: var(--bg3); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
.trend { font-size: 0.75rem; padding: 4px 8px; border-radius: 100px; }
.trend.up { background: var(--success-bg); color: var(--success); }
.trend.down { background: var(--danger-bg); color: var(--danger); }
.stat-value { font-size: 1.25rem; font-weight: 700; }
.stat-title { font-size: 0.8125rem; color: var(--text2); margin-top: 4px; }
.stat-subtitle { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }

/* Cards */
.card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; }
.card h3 { font-size: 1rem; margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* Empty State */
.empty-state { text-align: center; padding: 40px 20px; }
.empty-icon { width: 56px; height: 56px; background: var(--bg3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--muted); }
.empty-state h3 { font-size: 1rem; margin-bottom: 6px; }
.empty-state p { color: var(--muted); margin-bottom: 16px; font-size: 0.875rem; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; font-size: 0.875rem; font-weight: 600; border-radius: var(--radius-sm); border: none; cursor: pointer; }
.btn.primary { background: var(--accent); color: #fff; }
.btn.secondary { background: var(--bg2); border: 1px solid var(--border); }
.btn.small { padding: 6px 12px; font-size: 0.8125rem; }
.btn.danger { background: var(--danger-bg); color: var(--danger); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.icon-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: none; background: var(--bg2); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text2); }
.icon-btn:hover { background: var(--bg3); }
.icon-btn.danger:hover { background: var(--danger-bg); color: var(--danger); }

/* Quick Actions */
.quick-actions { display: flex; flex-direction: column; gap: 10px; }
.quick-actions button { display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.875rem; cursor: pointer; }
.quick-actions button:hover { background: var(--bg3); }

/* Transactions */
.txn-list { display: flex; flex-direction: column; }
.txn-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
.txn-item:last-child { border-bottom: none; }
.txn-info { flex: 1; min-width: 0; }
.txn-desc { display: block; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.txn-meta { font-size: 0.75rem; color: var(--muted); }
.txn-actions { display: flex; align-items: center; gap: 10px; }
.txn-amount { font-weight: 600; }
.txn-amount.income { color: var(--success); }
.txn-amount.expense { color: var(--danger); }

/* Upload */
.upload-section { max-width: 700px; }
.upload-zone { border: 2px dashed var(--border2); border-radius: var(--radius); padding: 48px; text-align: center; cursor: pointer; background: var(--bg2); }
.upload-zone:hover { border-color: var(--accent); background: var(--bg3); }
.upload-icon { width: 56px; height: 56px; background: var(--bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.upload-zone h3 { font-size: 1.125rem; margin-bottom: 6px; }
.upload-zone p { color: var(--muted); }
.spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--info); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

.notice { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-radius: var(--radius); margin-bottom: 16px; font-size: 0.875rem; }
.notice.info { background: var(--info-bg); color: #1e40af; }
.notice.error { background: var(--danger-bg); color: #991b1b; }
.notice strong { display: block; }
.notice p { margin-top: 4px; }

.tips { margin-top: 24px; padding: 16px; background: var(--bg2); border-radius: var(--radius); }
.tips h4 { margin-bottom: 8px; }
.tips ul { margin-left: 20px; color: var(--text2); font-size: 0.875rem; }
.tips li { margin-bottom: 4px; }

.debug-panel { margin-top: 16px; }
.debug-panel summary { cursor: pointer; font-size: 0.875rem; color: var(--text2); padding: 8px; background: var(--bg2); border-radius: var(--radius-sm); }
.debug-panel pre { margin-top: 8px; padding: 12px; background: #1e293b; color: #e2e8f0; border-radius: var(--radius-sm); font-size: 0.75rem; overflow: auto; max-height: 200px; }

/* Preview */
.preview-panel { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.preview-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--success-bg); border-bottom: 1px solid #bbf7d0; }
.preview-header h3 { display: flex; align-items: center; gap: 8px; color: #166534; font-size: 1rem; }
.preview-header p { color: #166534; font-size: 0.8125rem; margin-top: 4px; }
.preview-toolbar { padding: 12px 16px; background: var(--bg2); border-bottom: 1px solid var(--border); }
.preview-toolbar label { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; cursor: pointer; }
.preview-toolbar input { width: 16px; height: 16px; }
.preview-list { max-height: 360px; overflow-y: auto; }
.preview-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
.preview-item.selected { background: var(--bg2); }
.preview-item input { width: 16px; height: 16px; }
.preview-item .date { width: 90px; color: var(--muted); flex-shrink: 0; }
.preview-item .desc { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.preview-item select { padding: 6px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 0.75rem; width: 120px; }
.preview-item .amount { width: 90px; text-align: right; font-weight: 600; flex-shrink: 0; }
.preview-item .amount.income { color: var(--success); }
.preview-item .amount.expense { color: var(--danger); }
.preview-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg2); border-top: 1px solid var(--border); }
.summary { display: flex; gap: 20px; font-size: 0.875rem; }
.summary .income { color: var(--success); }
.summary .expense { color: var(--danger); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.modal { background: #fff; border-radius: var(--radius); width: 100%; max-width: 420px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 1rem; }
.close-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: none; background: var(--bg2); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.modal form { padding: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 0.8125rem; color: var(--text2); margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.9375rem; }
.form-group input:focus, .form-group select:focus { border-color: var(--accent); outline: none; }
.toggle-group { display: flex; gap: 8px; }
.toggle-group button { flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg2); cursor: pointer; font-size: 0.875rem; }
.toggle-group button.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

/* Settings */
.settings-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
.settings-row:last-child { border-bottom: none; }
.settings-row p { font-size: 0.8125rem; color: var(--muted); margin-top: 2px; }

/* Mobile */
.mobile-menu { display: none; position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background: var(--accent); color: #fff; border: none; border-radius: 50%; cursor: pointer; z-index: 200; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }

@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .main { margin-left: 0; padding: 20px 16px; }
  .mobile-menu { display: flex; align-items: center; justify-content: center; }
  .stats-grid { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 12px; }
  .header-actions { width: 100%; }
  .header-actions .btn { flex: 1; justify-content: center; }
  .preview-item { flex-wrap: wrap; }
  .preview-item .desc { width: 100%; order: 10; margin-top: 4px; }
}
`;
