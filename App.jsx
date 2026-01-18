import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Home, Upload, TrendingUp, ShoppingCart, RefreshCw, PieChart as PieIcon, Key, Car, Target, Lightbulb, Menu, X, ChevronRight, DollarSign, Percent, Calendar, Shield, ArrowUpRight, ArrowDownRight, Plus, FileText, CreditCard, Building, Dumbbell, Check, AlertTriangle, Info, Calculator, Wallet, PiggyBank, TrendingDown, Activity, Trash2, Edit2, Save, User, Settings, Download, RotateCcw } from 'lucide-react';

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// ============================================
// LOCAL STORAGE HOOKS
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
// DEFAULT DATA STRUCTURES
// ============================================
const defaultUserData = {
  name: '',
  setupComplete: false,
  monthlyIncome: 0,
  incomeSource: '',
};

const defaultTransactions = [];
const defaultSubscriptions = [];
const defaultAccounts = [];

const expenseCategories = [
  'Housing', 'Transportation', 'Groceries', 'Dining Out', 'Utilities',
  'Entertainment', 'Shopping', 'Healthcare', 'Insurance', 'Debt Payments',
  'Savings', 'Investments', 'Education', 'Personal Care', 'Gifts', 'Other'
];

const subscriptionCategories = [
  'Streaming', 'Music', 'Software', 'Gaming', 'News', 'Fitness',
  'Cloud Storage', 'Productivity', 'Education', 'Other'
];

// ============================================
// COMPONENTS
// ============================================

// Setup Wizard for new users
const SetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    monthlyIncome: '',
    incomeSource: 'Salary',
  });

  const handleComplete = () => {
    onComplete({
      ...userData,
      monthlyIncome: parseFloat(userData.monthlyIncome) || 0,
      setupComplete: true,
    });
  };

  return (
    <div className="setup-wizard">
      <div className="setup-card">
        <div className="setup-header">
          <h1>Welcome to ClearPath Finance</h1>
          <p>Let's set up your personal finance dashboard</p>
        </div>

        <div className="setup-progress">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {step === 1 && (
          <div className="setup-step">
            <h2>What's your name?</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="setup-input"
              autoFocus
            />
            <button
              className="setup-btn primary"
              onClick={() => setStep(2)}
              disabled={!userData.name.trim()}
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <h2>What's your monthly income?</h2>
            <p className="setup-hint">This helps us track your cash flow</p>
            <div className="input-with-icon">
              <DollarSign size={20} />
              <input
                type="number"
                placeholder="5000"
                value={userData.monthlyIncome}
                onChange={(e) => setUserData({ ...userData, monthlyIncome: e.target.value })}
                className="setup-input"
                autoFocus
              />
            </div>
            <div className="setup-buttons">
              <button className="setup-btn secondary" onClick={() => setStep(1)}>Back</button>
              <button
                className="setup-btn primary"
                onClick={() => setStep(3)}
                disabled={!userData.monthlyIncome}
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="setup-step">
            <h2>Primary income source?</h2>
            <div className="income-options">
              {['Salary', 'Self-employed', 'Freelance', 'Investments', 'Other'].map((source) => (
                <button
                  key={source}
                  className={`income-option ${userData.incomeSource === source ? 'selected' : ''}`}
                  onClick={() => setUserData({ ...userData, incomeSource: source })}
                >
                  {source}
                </button>
              ))}
            </div>
            <div className="setup-buttons">
              <button className="setup-btn secondary" onClick={() => setStep(2)}>Back</button>
              <button className="setup-btn primary" onClick={handleComplete}>
                Get Started <Check size={18} />
              </button>
            </div>
          </div>
        )}

        <button className="skip-setup" onClick={() => onComplete({ ...defaultUserData, setupComplete: true })}>
          Skip setup for now
        </button>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, description, action, onAction }) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Icon size={32} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && (
      <button className="btn primary" onClick={onAction}>
        <Plus size={16} /> {action}
      </button>
    )}
  </div>
);

// Transaction Form Modal
const TransactionModal = ({ isOpen, onClose, onSave, transaction = null }) => {
  const [form, setForm] = useState(transaction || {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Other',
    type: 'expense',
  });

  useEffect(() => {
    if (transaction) {
      setForm(transaction);
    } else {
      setForm({
        id: generateId(),
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: 'Other',
        type: 'expense',
      });
    }
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, amount: parseFloat(form.amount) });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${form.type === 'expense' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, type: 'expense' })}
              >
                Expense
              </button>
              <button
                type="button"
                className={`toggle-btn ${form.type === 'income' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, type: 'income' })}
              >
                Income
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="e.g., Grocery shopping"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <div className="input-with-icon">
              <DollarSign size={16} />
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {expenseCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">
              <Save size={16} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Subscription Form Modal
const SubscriptionModal = ({ isOpen, onClose, onSave, subscription = null }) => {
  const [form, setForm] = useState(subscription || {
    id: generateId(),
    name: '',
    amount: '',
    category: 'Other',
    billingCycle: 'monthly',
    nextBilling: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (subscription) {
      setForm(subscription);
    } else {
      setForm({
        id: generateId(),
        name: '',
        amount: '',
        category: 'Other',
        billingCycle: 'monthly',
        nextBilling: new Date().toISOString().split('T')[0],
      });
    }
  }, [subscription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, amount: parseFloat(form.amount) });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{subscription ? 'Edit Subscription' : 'Add Subscription'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Name</label>
            <input
              type="text"
              placeholder="e.g., Netflix"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <div className="input-with-icon">
              <DollarSign size={16} />
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {subscriptionCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Billing Cycle</label>
              <select
                value={form.billingCycle}
                onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Next Billing Date</label>
            <input
              type="date"
              value={form.nextBilling}
              onChange={(e) => setForm({ ...form, nextBilling: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">
              <Save size={16} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Income Settings Modal
const IncomeModal = ({ isOpen, onClose, userData, onSave }) => {
  const [income, setIncome] = useState(userData.monthlyIncome || '');

  useEffect(() => {
    setIncome(userData.monthlyIncome || '');
  }, [userData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Monthly Income</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="form-group">
          <label>Monthly Income</label>
          <div className="input-with-icon">
            <DollarSign size={16} />
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="Enter your monthly income"
            />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn primary"
            onClick={() => {
              onSave(parseFloat(income) || 0);
              onClose();
            }}
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, onClick }) => (
  <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div className="stat-card-header">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`stat-trend ${trend}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
    {subtitle && <div className="stat-subtitle">{subtitle}</div>}
  </div>
);

// Mortgage Calculator Component
const MortgageCalculator = () => {
  const [inputs, setInputs] = useState({
    homePrice: 400000,
    downPayment: 80000,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 4800,
    insurance: 1800,
  });

  const results = useMemo(() => {
    const principal = inputs.homePrice - inputs.downPayment;
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;

    if (monthlyRate === 0) {
      return {
        monthlyPayment: principal / numPayments + inputs.propertyTax / 12 + inputs.insurance / 12,
        principalInterest: principal / numPayments,
        taxes: inputs.propertyTax / 12,
        insurance: inputs.insurance / 12,
        totalInterest: 0,
      };
    }

    const monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalMonthly = monthlyPI + inputs.propertyTax / 12 + inputs.insurance / 12;
    const totalInterest = (monthlyPI * numPayments) - principal;

    return {
      monthlyPayment: totalMonthly,
      principalInterest: monthlyPI,
      taxes: inputs.propertyTax / 12,
      insurance: inputs.insurance / 12,
      totalInterest,
    };
  }, [inputs]);

  return (
    <div className="calculator-section">
      <div className="calculator-inputs">
        <div className="form-group">
          <label>Home Price</label>
          <div className="input-with-icon">
            <DollarSign size={16} />
            <input
              type="number"
              value={inputs.homePrice}
              onChange={(e) => setInputs({ ...inputs, homePrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Down Payment</label>
          <div className="input-with-icon">
            <DollarSign size={16} />
            <input
              type="number"
              value={inputs.downPayment}
              onChange={(e) => setInputs({ ...inputs, downPayment: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <span className="input-hint">
            {inputs.homePrice > 0 ? `${((inputs.downPayment / inputs.homePrice) * 100).toFixed(0)}% down` : ''}
          </span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Interest Rate (%)</label>
            <input
              type="number"
              step="0.125"
              value={inputs.interestRate}
              onChange={(e) => setInputs({ ...inputs, interestRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Loan Term</label>
            <select
              value={inputs.loanTerm}
              onChange={(e) => setInputs({ ...inputs, loanTerm: parseInt(e.target.value) })}
            >
              <option value={30}>30 years</option>
              <option value={20}>20 years</option>
              <option value={15}>15 years</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Annual Property Tax</label>
            <div className="input-with-icon">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.propertyTax}
                onChange={(e) => setInputs({ ...inputs, propertyTax: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Annual Insurance</label>
            <div className="input-with-icon">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.insurance}
                onChange={(e) => setInputs({ ...inputs, insurance: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="calculator-results">
        <div className="result-hero">
          <span className="result-label">Monthly Payment</span>
          <span className="result-value">{formatCurrency(results.monthlyPayment)}</span>
          <span className="result-subtitle">Principal, Interest, Taxes & Insurance</span>
        </div>
        <div className="result-breakdown">
          <div className="breakdown-item">
            <span>Principal & Interest</span>
            <span>{formatCurrency(results.principalInterest)}</span>
          </div>
          <div className="breakdown-item">
            <span>Property Tax</span>
            <span>{formatCurrency(results.taxes)}</span>
          </div>
          <div className="breakdown-item">
            <span>Insurance</span>
            <span>{formatCurrency(results.insurance)}</span>
          </div>
          <div className="breakdown-divider"></div>
          <div className="breakdown-item total">
            <span>Total Interest (Life of Loan)</span>
            <span>{formatCurrency(results.totalInterest)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vehicle Calculator Component
const VehicleCalculator = () => {
  const [inputs, setInputs] = useState({
    vehiclePrice: 35000,
    downPayment: 5000,
    loanRate: 6.5,
    loanTerm: 60,
    leasePayment: 400,
    leaseTerm: 36,
    leaseDownPayment: 2000,
    expectedResale: 18000,
  });

  const results = useMemo(() => {
    // Cash purchase
    const cashTotal = inputs.vehiclePrice;
    const cashNetCost = cashTotal - inputs.expectedResale;

    // Financing
    const loanAmount = inputs.vehiclePrice - inputs.downPayment;
    const monthlyRate = inputs.loanRate / 100 / 12;
    const financePayment = monthlyRate > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, inputs.loanTerm)) / (Math.pow(1 + monthlyRate, inputs.loanTerm) - 1)
      : loanAmount / inputs.loanTerm;
    const financeTotal = inputs.downPayment + (financePayment * inputs.loanTerm);
    const financeNetCost = financeTotal - inputs.expectedResale;

    // Leasing (for same period as loan)
    const numLeases = Math.ceil(inputs.loanTerm / inputs.leaseTerm);
    const leaseTotal = (inputs.leaseDownPayment + (inputs.leasePayment * inputs.leaseTerm)) * numLeases;

    return {
      cash: { total: cashTotal, netCost: cashNetCost },
      finance: { payment: financePayment, total: financeTotal, netCost: financeNetCost },
      lease: { total: leaseTotal, numLeases },
    };
  }, [inputs]);

  const bestOption = results.cash.netCost <= results.finance.netCost && results.cash.netCost <= results.lease.total
    ? 'cash'
    : results.finance.netCost <= results.lease.total ? 'finance' : 'lease';

  return (
    <div className="calculator-section">
      <div className="calculator-inputs">
        <div className="form-group">
          <label>Vehicle Price</label>
          <div className="input-with-icon">
            <DollarSign size={16} />
            <input
              type="number"
              value={inputs.vehiclePrice}
              onChange={(e) => setInputs({ ...inputs, vehiclePrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Down Payment (Buy/Finance)</label>
            <div className="input-with-icon">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.downPayment}
                onChange={(e) => setInputs({ ...inputs, downPayment: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Expected Resale Value</label>
            <div className="input-with-icon">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.expectedResale}
                onChange={(e) => setInputs({ ...inputs, expectedResale: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Loan Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={inputs.loanRate}
              onChange={(e) => setInputs({ ...inputs, loanRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Loan Term (months)</label>
            <input
              type="number"
              value={inputs.loanTerm}
              onChange={(e) => setInputs({ ...inputs, loanTerm: parseInt(e.target.value) || 60 })}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Lease Payment/Month</label>
            <div className="input-with-icon">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.leasePayment}
                onChange={(e) => setInputs({ ...inputs, leasePayment: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Lease Term (months)</label>
            <input
              type="number"
              value={inputs.leaseTerm}
              onChange={(e) => setInputs({ ...inputs, leaseTerm: parseInt(e.target.value) || 36 })}
            />
          </div>
        </div>
      </div>

      <div className="vehicle-comparison">
        <div className={`vehicle-option ${bestOption === 'cash' ? 'best' : ''}`}>
          <h4><Wallet size={18} /> Buy Cash</h4>
          {bestOption === 'cash' && <span className="best-badge">Best Value</span>}
          <div className="option-amount">{formatCurrency(results.cash.netCost)}</div>
          <div className="option-label">Net cost after resale</div>
        </div>
        <div className={`vehicle-option ${bestOption === 'finance' ? 'best' : ''}`}>
          <h4><Building size={18} /> Finance</h4>
          {bestOption === 'finance' && <span className="best-badge">Best Value</span>}
          <div className="option-amount">{formatCurrency(results.finance.netCost)}</div>
          <div className="option-label">{formatCurrency(results.finance.payment)}/mo for {inputs.loanTerm} mo</div>
        </div>
        <div className={`vehicle-option ${bestOption === 'lease' ? 'best' : ''}`}>
          <h4><Key size={18} /> Lease</h4>
          {bestOption === 'lease' && <span className="best-badge">Best Value</span>}
          <div className="option-amount">{formatCurrency(results.lease.total)}</div>
          <div className="option-label">{results.lease.numLeases} lease(s), no ownership</div>
        </div>
      </div>
    </div>
  );
};

// Retirement Calculator Component
const RetirementCalculator = () => {
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 500,
    expectedReturn: 7,
    desiredIncome: 5000,
  });

  const results = useMemo(() => {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    const monthlyReturn = inputs.expectedReturn / 100 / 12;
    const months = yearsToRetirement * 12;

    const futureValue = inputs.currentSavings * Math.pow(1 + monthlyReturn, months) +
      inputs.monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);

    // Using 4% safe withdrawal rate
    const annualWithdrawal = futureValue * 0.04;
    const monthlyWithdrawal = annualWithdrawal / 12;

    const progress = (monthlyWithdrawal / inputs.desiredIncome) * 100;

    return {
      futureValue,
      monthlyWithdrawal,
      progress: Math.min(progress, 100),
      yearsToRetirement,
    };
  }, [inputs]);

  return (
    <div className="calculator-section">
      <div className="calculator-inputs">
        <div className="form-row">
          <div className="form-group">
            <label>Current Age</label>
            <input
              type="number"
              value={inputs.currentAge}
              onChange={(e) => setInputs({ ...inputs, currentAge: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Retirement Age</label>
            <input
              type="number"
              value={inputs.retirementAge}
              onChange={(e) => setInputs({ ...inputs, retirementAge: parseInt(e.target.value) || 65 })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Current Retirement Savings</label>
          <div className="input-with-icon">
            <DollarSign size={16} />
            <input
              type="number"
              value={inputs.currentSavings}
              onChange={(e) => setInputs({ ...inputs, currentSavings: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Monthly Contribution</label>
          <div className="input-with-icon">
            <DollarSign size={16} />
            <input
              type="number"
              value={inputs.monthlyContribution}
              onChange={(e) => setInputs({ ...inputs, monthlyContribution: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Expected Return (%)</label>
            <input
              type="number"
              step="0.5"
              value={inputs.expectedReturn}
              onChange={(e) => setInputs({ ...inputs, expectedReturn: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Desired Monthly Income</label>
            <div className="input-with-icon">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.desiredIncome}
                onChange={(e) => setInputs({ ...inputs, desiredIncome: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="calculator-results">
        <div className="result-hero">
          <span className="result-label">Projected Savings at {inputs.retirementAge}</span>
          <span className="result-value">{formatCurrency(results.futureValue)}</span>
          <span className="result-subtitle">{results.yearsToRetirement} years to grow</span>
        </div>
        <div className="retirement-stats">
          <div className="retirement-stat">
            <span className="stat-number">{formatCurrency(results.monthlyWithdrawal)}</span>
            <span className="stat-label">Monthly income (4% rule)</span>
          </div>
          <div className="retirement-stat">
            <span className="stat-number">{results.progress.toFixed(0)}%</span>
            <span className="stat-label">Of your goal</span>
          </div>
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${results.progress}%` }}
            ></div>
          </div>
          <div className={`progress-status ${results.progress >= 100 ? 'success' : 'warning'}`}>
            {results.progress >= 100 ? (
              <><Check size={16} /> On track to meet your goal!</>
            ) : (
              <><AlertTriangle size={16} /> Consider increasing contributions</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function ClearPathFinance() {
  // State
  const [userData, setUserData] = useLocalStorage('clearpath_user', defaultUserData);
  const [transactions, setTransactions] = useLocalStorage('clearpath_transactions', defaultTransactions);
  const [subscriptions, setSubscriptions] = useLocalStorage('clearpath_subscriptions', defaultSubscriptions);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);

  // Computed values
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthlyData = useMemo(() => {
    const thisMonthTransactions = transactions.filter(t => t.date?.startsWith(currentMonth));
    const expenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const income = thisMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || userData.monthlyIncome;
    const subscriptionTotal = subscriptions.reduce((sum, s) => {
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      if (s.billingCycle === 'weekly') return sum + s.amount * 4;
      return sum + s.amount;
    }, 0);
    
    return {
      income,
      expenses: expenses + subscriptionTotal,
      netCashFlow: income - expenses - subscriptionTotal,
      subscriptionTotal,
    };
  }, [transactions, subscriptions, userData.monthlyIncome, currentMonth]);

  const expensesByCategory = useMemo(() => {
    const thisMonthExpenses = transactions.filter(t => t.date?.startsWith(currentMonth) && t.type === 'expense');
    const grouped = {};
    thisMonthExpenses.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth]);

  const chartColors = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

  // Handlers
  const handleSaveTransaction = (transaction) => {
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions([...transactions, transaction]);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleSaveSubscription = (subscription) => {
    if (editingSubscription) {
      setSubscriptions(subscriptions.map(s => s.id === subscription.id ? subscription : s));
    } else {
      setSubscriptions([...subscriptions, subscription]);
    }
    setEditingSubscription(null);
  };

  const handleDeleteSubscription = (id) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = { userData, transactions, subscriptions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clearpath-finance-backup.json';
    a.click();
  };

  // Show setup wizard for new users
  if (!userData.setupComplete) {
    return (
      <>
        <style>{styles}</style>
        <SetupWizard onComplete={setUserData} />
      </>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
    { id: 'mortgage', label: 'Mortgage Calculator', icon: Building },
    { id: 'vehicle', label: 'Vehicle Calculator', icon: Car },
    { id: 'retirement', label: 'Retirement Planner', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Sidebar */}
        <nav className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="logo">
            <h1>ClearPath</h1>
            <span>Personal Finance</span>
          </div>

          <div className="user-greeting">
            <User size={18} />
            <span>Hi, {userData.name || 'there'}!</span>
          </div>

          <ul className="nav-list">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Main content */}
        <main className="main-content">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <>
              <header className="page-header">
                <h2>Dashboard</h2>
                <p>Your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </header>

              <div className="stats-grid">
                <StatCard
                  title="Monthly Income"
                  value={formatCurrency(monthlyData.income)}
                  icon={TrendingUp}
                  onClick={() => setShowIncomeModal(true)}
                  subtitle="Click to update"
                />
                <StatCard
                  title="Monthly Expenses"
                  value={formatCurrency(monthlyData.expenses)}
                  icon={ShoppingCart}
                />
                <StatCard
                  title="Net Cash Flow"
                  value={formatCurrency(monthlyData.netCashFlow)}
                  icon={DollarSign}
                  trend={monthlyData.netCashFlow >= 0 ? 'up' : 'down'}
                />
                <StatCard
                  title="Subscriptions"
                  value={formatCurrency(monthlyData.subscriptionTotal)}
                  icon={RefreshCw}
                  subtitle={`${subscriptions.length} active`}
                />
              </div>

              <div className="dashboard-grid">
                <div className="card">
                  <div className="card-header">
                    <h3>Spending by Category</h3>
                  </div>
                  {expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState
                      icon={PieIcon}
                      title="No expenses yet"
                      description="Add transactions to see your spending breakdown"
                      action="Add Transaction"
                      onAction={() => { setEditingTransaction(null); setShowTransactionModal(true); }}
                    />
                  )}
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3>Quick Actions</h3>
                  </div>
                  <div className="quick-actions">
                    <button className="quick-action" onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}>
                      <Plus size={18} /> Add Transaction
                    </button>
                    <button className="quick-action" onClick={() => { setEditingSubscription(null); setShowSubscriptionModal(true); }}>
                      <Plus size={18} /> Add Subscription
                    </button>
                    <button className="quick-action" onClick={() => setActiveSection('mortgage')}>
                      <Calculator size={18} /> Mortgage Calculator
                    </button>
                    <button className="quick-action" onClick={() => setActiveSection('retirement')}>
                      <Target size={18} /> Retirement Planner
                    </button>
                  </div>
                </div>

                <div className="card full-width">
                  <div className="card-header">
                    <h3>Recent Transactions</h3>
                    <button className="btn small" onClick={() => setActiveSection('transactions')}>
                      View All
                    </button>
                  </div>
                  {transactions.length > 0 ? (
                    <div className="transaction-list">
                      {transactions.slice(-5).reverse().map(t => (
                        <div key={t.id} className="transaction-item">
                          <div className="transaction-info">
                            <span className="transaction-desc">{t.description}</span>
                            <span className="transaction-meta">{t.category} • {t.date}</span>
                          </div>
                          <span className={`transaction-amount ${t.type}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={CreditCard}
                      title="No transactions yet"
                      description="Start tracking your spending by adding transactions"
                      action="Add Transaction"
                      onAction={() => { setEditingTransaction(null); setShowTransactionModal(true); }}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Transactions */}
          {activeSection === 'transactions' && (
            <>
              <header className="page-header">
                <div>
                  <h2>Transactions</h2>
                  <p>Track your income and expenses</p>
                </div>
                <button className="btn primary" onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}>
                  <Plus size={16} /> Add Transaction
                </button>
              </header>

              {transactions.length > 0 ? (
                <div className="card">
                  <div className="transaction-list">
                    {[...transactions].reverse().map(t => (
                      <div key={t.id} className="transaction-item">
                        <div className="transaction-info">
                          <span className="transaction-desc">{t.description}</span>
                          <span className="transaction-meta">{t.category} • {t.date}</span>
                        </div>
                        <div className="transaction-actions">
                          <span className={`transaction-amount ${t.type}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                          <button
                            className="icon-btn"
                            onClick={() => { setEditingTransaction(t); setShowTransactionModal(true); }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDeleteTransaction(t.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <EmptyState
                    icon={CreditCard}
                    title="No transactions yet"
                    description="Start tracking your spending by adding your first transaction"
                    action="Add Transaction"
                    onAction={() => { setEditingTransaction(null); setShowTransactionModal(true); }}
                  />
                </div>
              )}
            </>
          )}

          {/* Subscriptions */}
          {activeSection === 'subscriptions' && (
            <>
              <header className="page-header">
                <div>
                  <h2>Subscriptions</h2>
                  <p>Manage your recurring charges</p>
                </div>
                <button className="btn primary" onClick={() => { setEditingSubscription(null); setShowSubscriptionModal(true); }}>
                  <Plus size={16} /> Add Subscription
                </button>
              </header>

              <div className="stats-grid small">
                <StatCard
                  title="Monthly Total"
                  value={formatCurrency(monthlyData.subscriptionTotal)}
                  icon={RefreshCw}
                />
                <StatCard
                  title="Yearly Total"
                  value={formatCurrency(monthlyData.subscriptionTotal * 12)}
                  icon={Calendar}
                />
                <StatCard
                  title="Active Subscriptions"
                  value={subscriptions.length.toString()}
                  icon={Activity}
                />
              </div>

              {subscriptions.length > 0 ? (
                <div className="card">
                  <div className="subscription-list">
                    {subscriptions.map(s => (
                      <div key={s.id} className="subscription-item">
                        <div className="subscription-info">
                          <span className="subscription-name">{s.name}</span>
                          <span className="subscription-meta">{s.category} • {s.billingCycle}</span>
                        </div>
                        <div className="subscription-actions">
                          <span className="subscription-amount">{formatCurrency(s.amount)}</span>
                          <button
                            className="icon-btn"
                            onClick={() => { setEditingSubscription(s); setShowSubscriptionModal(true); }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => handleDeleteSubscription(s.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <EmptyState
                    icon={RefreshCw}
                    title="No subscriptions yet"
                    description="Add your recurring charges to track them"
                    action="Add Subscription"
                    onAction={() => { setEditingSubscription(null); setShowSubscriptionModal(true); }}
                  />
                </div>
              )}
            </>
          )}

          {/* Mortgage Calculator */}
          {activeSection === 'mortgage' && (
            <>
              <header className="page-header">
                <h2>Mortgage Calculator</h2>
                <p>Calculate your monthly mortgage payments</p>
              </header>
              <div className="card">
                <MortgageCalculator />
              </div>
            </>
          )}

          {/* Vehicle Calculator */}
          {activeSection === 'vehicle' && (
            <>
              <header className="page-header">
                <h2>Vehicle Calculator</h2>
                <p>Compare buying, financing, or leasing a vehicle</p>
              </header>
              <div className="card">
                <VehicleCalculator />
              </div>
            </>
          )}

          {/* Retirement Calculator */}
          {activeSection === 'retirement' && (
            <>
              <header className="page-header">
                <h2>Retirement Planner</h2>
                <p>Plan for your financial future</p>
              </header>
              <div className="card">
                <RetirementCalculator />
              </div>
            </>
          )}

          {/* Settings */}
          {activeSection === 'settings' && (
            <>
              <header className="page-header">
                <h2>Settings</h2>
                <p>Manage your account and data</p>
              </header>

              <div className="card">
                <h3 className="card-title">Profile</h3>
                <div className="settings-item">
                  <div>
                    <strong>Name</strong>
                    <p>{userData.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="settings-item">
                  <div>
                    <strong>Monthly Income</strong>
                    <p>{formatCurrency(userData.monthlyIncome)}</p>
                  </div>
                  <button className="btn small" onClick={() => setShowIncomeModal(true)}>
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Data Management</h3>
                <div className="settings-item">
                  <div>
                    <strong>Export Data</strong>
                    <p>Download a backup of all your data</p>
                  </div>
                  <button className="btn small" onClick={handleExportData}>
                    <Download size={14} /> Export
                  </button>
                </div>
                <div className="settings-item">
                  <div>
                    <strong>Reset All Data</strong>
                    <p>Delete all data and start fresh</p>
                  </div>
                  <button className="btn small danger" onClick={handleResetData}>
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">About</h3>
                <p style={{ color: '#64748b', marginTop: 8 }}>
                  ClearPath Finance stores all data locally in your browser. Your financial information never leaves your device.
                </p>
              </div>
            </>
          )}
        </main>

        {/* Modals */}
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
          onSave={handleSaveTransaction}
          transaction={editingTransaction}
        />
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => { setShowSubscriptionModal(false); setEditingSubscription(null); }}
          onSave={handleSaveSubscription}
          subscription={editingSubscription}
        />
        <IncomeModal
          isOpen={showIncomeModal}
          onClose={() => setShowIncomeModal(false)}
          userData={userData}
          onSave={(income) => setUserData({ ...userData, monthlyIncome: income })}
        />
      </div>
    </>
  );
}

// ============================================
// STYLES
// ============================================
const styles = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --border-color: #e2e8f0;
  --border-dark: #cbd5e1;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --accent: #0f172a;
  --success: #10b981;
  --success-bg: #ecfdf5;
  --warning: #f59e0b;
  --warning-bg: #fffbeb;
  --danger: #ef4444;
  --danger-bg: #fef2f2;
  --radius: 12px;
  --radius-sm: 8px;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
}

.app {
  display: flex;
  min-height: 100vh;
}

/* Setup Wizard */
.setup-wizard {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
}

.setup-card {
  background: white;
  border-radius: 20px;
  padding: 48px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}

.setup-header {
  text-align: center;
  margin-bottom: 32px;
}

.setup-header h1 {
  font-size: 1.75rem;
  margin-bottom: 8px;
}

.setup-header p {
  color: var(--text-secondary);
}

.setup-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
}

.progress-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.progress-dot.active {
  background: var(--accent);
  color: white;
}

.progress-line {
  width: 40px;
  height: 3px;
  background: var(--bg-tertiary);
  border-radius: 2px;
}

.progress-line.active {
  background: var(--accent);
}

.setup-step {
  text-align: center;
}

.setup-step h2 {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.setup-hint {
  color: var(--text-muted);
  margin-bottom: 24px;
  font-size: 0.9375rem;
}

.setup-input {
  width: 100%;
  padding: 16px;
  font-size: 1.125rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  text-align: center;
  margin-bottom: 24px;
  outline: none;
  transition: border-color 0.2s;
}

.setup-input:focus {
  border-color: var(--accent);
}

.input-with-icon {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  padding: 0 16px;
  margin-bottom: 24px;
}

.input-with-icon:focus-within {
  border-color: var(--accent);
}

.input-with-icon input {
  flex: 1;
  border: none;
  padding: 16px 0;
  font-size: 1.125rem;
  text-align: center;
  outline: none;
}

.setup-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.setup-btn.primary {
  background: var(--accent);
  color: white;
}

.setup-btn.primary:hover {
  opacity: 0.9;
}

.setup-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.setup-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.setup-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.income-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 32px;
}

.income-option {
  padding: 12px 20px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  background: white;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.income-option:hover {
  border-color: var(--border-dark);
}

.income-option.selected {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.skip-setup {
  display: block;
  margin: 32px auto 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.875rem;
}

.skip-setup:hover {
  color: var(--text-secondary);
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 24px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
  transition: transform 0.3s;
}

.logo {
  padding: 0 24px 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
}

.logo span {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  border-bottom: 1px solid var(--border-color);
}

.nav-list {
  list-style: none;
  padding: 16px 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  transition: all 0.15s;
}

.nav-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-link.active {
  background: var(--accent);
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 32px 40px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.page-header p {
  color: var(--text-secondary);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stats-grid.small {
  grid-template-columns: repeat(3, 1fr);
}

.stat-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 20px;
  transition: all 0.2s;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card:hover {
  border-color: var(--border-dark);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 100px;
}

.stat-trend.up {
  background: var(--success-bg);
  color: var(--success);
}

.stat-trend.down {
  background: var(--danger-bg);
  color: var(--danger);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Cards */
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3, .card-title {
  font-size: 1.125rem;
  font-weight: 600;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.dashboard-grid .full-width {
  grid-column: 1 / -1;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: var(--bg-tertiary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: var(--text-muted);
}

.empty-state h3 {
  font-size: 1.125rem;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 20px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn.primary {
  background: var(--accent);
  color: white;
}

.btn.primary:hover {
  opacity: 0.9;
}

.btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn.small {
  padding: 8px 14px;
  font-size: 0.8125rem;
}

.btn.danger {
  background: var(--danger-bg);
  color: var(--danger);
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--bg-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.icon-btn:hover {
  background: var(--bg-tertiary);
}

.icon-btn.danger:hover {
  background: var(--danger-bg);
  color: var(--danger);
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.quick-action:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-dark);
}

/* Transaction List */
.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  display: flex;
  flex-direction: column;
}

.transaction-desc {
  font-weight: 500;
}

.transaction-meta {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.transaction-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transaction-amount {
  font-weight: 600;
  font-size: 1rem;
}

.transaction-amount.expense {
  color: var(--danger);
}

.transaction-amount.income {
  color: var(--success);
}

/* Subscription List */
.subscription-list {
  display: flex;
  flex-direction: column;
}

.subscription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.subscription-item:last-child {
  border-bottom: none;
}

.subscription-name {
  font-weight: 500;
}

.subscription-meta {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.subscription-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subscription-amount {
  font-weight: 600;
  font-size: 1.125rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: var(--radius);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--bg-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal form, .modal > div:not(.modal-header) {
  padding: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 14px;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  outline: none;
  transition: border-color 0.15s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--accent);
}

.form-group .input-with-icon {
  margin-bottom: 0;
}

.form-group .input-with-icon input {
  text-align: left;
}

.input-hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.15s;
}

.toggle-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

/* Calculator Styles */
.calculator-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.calculator-inputs .form-group {
  margin-bottom: 16px;
}

.calculator-results .result-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: var(--radius);
  padding: 28px;
  text-align: center;
  color: white;
  margin-bottom: 20px;
}

.result-label {
  font-size: 0.875rem;
  opacity: 0.8;
  display: block;
}

.result-value {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 8px 0;
}

.result-subtitle {
  font-size: 0.8125rem;
  opacity: 0.7;
}

.result-breakdown {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 20px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 0.9375rem;
}

.breakdown-item.total {
  font-weight: 600;
}

.breakdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

/* Vehicle Comparison */
.vehicle-comparison {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.vehicle-option {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
  position: relative;
}

.vehicle-option.best {
  border-color: var(--success);
  background: var(--success-bg);
}

.vehicle-option h4 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.best-badge {
  position: absolute;
  top: -10px;
  right: 12px;
  background: var(--success);
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 100px;
}

.option-amount {
  font-size: 1.5rem;
  font-weight: 700;
}

.option-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Retirement Stats */
.retirement-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.retirement-stat {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  display: block;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.progress-container {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 16px;
}

.progress-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--success);
  border-radius: 100px;
  transition: width 0.3s;
}

.progress-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-status.success {
  color: var(--success);
}

.progress-status.warning {
  color: var(--warning);
}

/* Settings */
.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Mobile */
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 200;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  align-items: center;
  justify-content: center;
}

@media (max-width: 1024px) {
  .calculator-section {
    grid-template-columns: 1fr;
  }
  
  .vehicle-comparison {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
    padding: 24px;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid.small {
    grid-template-columns: 1fr;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}
`;
