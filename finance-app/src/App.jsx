import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Home, Upload, TrendingUp, ShoppingCart, RefreshCw, PieChart as PieIcon, Key, Car, Target, Lightbulb, BarChart3, Menu, X, ChevronRight, DollarSign, Percent, Calendar, Shield, ArrowUpRight, ArrowDownRight, Plus, FileText, CreditCard, Building, Fuel, Coffee, Film, Music, Cloud, Newspaper, Dumbbell, Check, AlertTriangle, Info, Calculator, Wallet, PiggyBank, TrendingDown, Activity } from 'lucide-react';

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value) => `${value.toFixed(1)}%`;

// Sample data
const monthlySpendingData = [
  { month: 'Jul', income: 8200, expenses: 4850, savings: 3350 },
  { month: 'Aug', income: 8300, expenses: 5100, savings: 3200 },
  { month: 'Sep', income: 8450, expenses: 4920, savings: 3530 },
  { month: 'Oct', income: 8400, expenses: 5300, savings: 3100 },
  { month: 'Nov', income: 8500, expenses: 5800, savings: 2700 },
  { month: 'Dec', income: 9200, expenses: 6400, savings: 2800 },
  { month: 'Jan', income: 8450, expenses: 5230, savings: 3220 },
];

const spendingByCategory = [
  { name: 'Housing', value: 2100, color: '#0f172a' },
  { name: 'Transportation', value: 680, color: '#334155' },
  { name: 'Groceries', value: 620, color: '#64748b' },
  { name: 'Dining', value: 485, color: '#94a3b8' },
  { name: 'Shopping', value: 420, color: '#cbd5e1' },
  { name: 'Utilities', value: 340, color: '#e2e8f0' },
  { name: 'Other', value: 585, color: '#f1f5f9' },
];

const investmentGrowthData = [
  { year: '2020', value: 45000 },
  { year: '2021', value: 62000 },
  { year: '2022', value: 58000 },
  { year: '2023', value: 89000 },
  { year: '2024', value: 125000 },
  { year: '2025', value: 145230 },
];

const subscriptions = [
  { name: 'Netflix', category: 'Entertainment', amount: 15.99, icon: Film, lastCharge: '2 days ago' },
  { name: 'Spotify Family', category: 'Entertainment', amount: 16.99, icon: Music, lastCharge: '5 days ago' },
  { name: 'Amazon Prime', category: 'Shopping', amount: 14.99, icon: ShoppingCart, lastCharge: '12 days ago' },
  { name: 'Gym Membership', category: 'Health', amount: 49.99, icon: Dumbbell, lastCharge: '8 days ago', warning: 'No visits in 45 days' },
  { name: 'iCloud Storage', category: 'Utilities', amount: 2.99, icon: Cloud, lastCharge: '1 day ago' },
  { name: 'NYT Digital', category: 'News', amount: 17.00, icon: Newspaper, lastCharge: '15 days ago' },
  { name: 'Disney+', category: 'Entertainment', amount: 13.99, icon: Film, lastCharge: '10 days ago' },
  { name: 'Hulu', category: 'Entertainment', amount: 17.99, icon: Film, lastCharge: '10 days ago' },
];

const amortizationData = Array.from({ length: 30 }, (_, i) => {
  const year = i + 1;
  const principal = 320000;
  const rate = 0.065 / 12;
  const term = 360;
  const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  
  let balance = principal;
  let totalPrincipal = 0;
  let totalInterest = 0;
  
  for (let m = 0; m < year * 12; m++) {
    const interest = balance * rate;
    const princ = payment - interest;
    totalInterest += interest;
    totalPrincipal += princ;
    balance -= princ;
  }
  
  return {
    year,
    principal: totalPrincipal,
    interest: totalInterest,
    balance: Math.max(0, balance),
    equity: totalPrincipal + 80000, // Including down payment
  };
});

// Components
const StatCard = ({ title, value, trend, trendValue, icon: Icon, subtitle }) => (
  <div className="stat-card">
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

const InsightCard = ({ type, title, description, action }) => {
  const icons = { tip: Lightbulb, warning: AlertTriangle, info: Info };
  const Icon = icons[type] || Info;
  
  return (
    <div className={`insight-card ${type}`}>
      <div className="insight-icon">
        <Icon size={18} />
      </div>
      <div className="insight-content">
        <h4>{title}</h4>
        <p>{description}</p>
        {action && <button className="insight-action">{action} <ChevronRight size={14} /></button>}
      </div>
    </div>
  );
};

const SubscriptionItem = ({ subscription, onCancel }) => {
  const Icon = subscription.icon;
  return (
    <div className="subscription-item">
      <div className="subscription-left">
        <div className="subscription-icon">
          <Icon size={20} />
        </div>
        <div className="subscription-info">
          <div className="subscription-name">{subscription.name}</div>
          <div className="subscription-meta">
            {subscription.category} • {subscription.lastCharge}
          </div>
          {subscription.warning && (
            <div className="subscription-warning">
              <AlertTriangle size={12} /> {subscription.warning}
            </div>
          )}
        </div>
      </div>
      <div className="subscription-right">
        <div className="subscription-amount">${subscription.amount.toFixed(2)}</div>
        <div className="subscription-period">/month</div>
      </div>
    </div>
  );
};

// Calculator Components
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
    
    const monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const monthlyTax = inputs.propertyTax / 12;
    const monthlyIns = inputs.insurance / 12;
    const totalMonthly = monthlyPI + monthlyTax + monthlyIns;
    const totalInterest = (monthlyPI * numPayments) - principal;
    
    return {
      monthlyPayment: totalMonthly,
      principalInterest: monthlyPI,
      taxes: monthlyTax,
      insurance: monthlyIns,
      totalInterest,
      loanAmount: principal,
    };
  }, [inputs]);
  
  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };
  
  return (
    <div className="calculator-container">
      <div className="calculator-inputs">
        <h3>Mortgage Details</h3>
        
        <div className="input-group">
          <label>Home Price</label>
          <div className="input-wrapper">
            <DollarSign size={16} />
            <input
              type="number"
              value={inputs.homePrice}
              onChange={(e) => handleChange('homePrice', e.target.value)}
            />
          </div>
        </div>
        
        <div className="input-group">
          <label>Down Payment</label>
          <div className="input-wrapper">
            <DollarSign size={16} />
            <input
              type="number"
              value={inputs.downPayment}
              onChange={(e) => handleChange('downPayment', e.target.value)}
            />
          </div>
          <span className="input-hint">{((inputs.downPayment / inputs.homePrice) * 100).toFixed(0)}% of home price</span>
        </div>
        
        <div className="input-row">
          <div className="input-group">
            <label>Interest Rate</label>
            <div className="input-wrapper">
              <Percent size={16} />
              <input
                type="number"
                step="0.125"
                value={inputs.interestRate}
                onChange={(e) => handleChange('interestRate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Loan Term</label>
            <select
              value={inputs.loanTerm}
              onChange={(e) => handleChange('loanTerm', e.target.value)}
              className="select-input"
            >
              <option value={30}>30 years</option>
              <option value={20}>20 years</option>
              <option value={15}>15 years</option>
              <option value={10}>10 years</option>
            </select>
          </div>
        </div>
        
        <div className="input-row">
          <div className="input-group">
            <label>Annual Property Tax</label>
            <div className="input-wrapper">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.propertyTax}
                onChange={(e) => handleChange('propertyTax', e.target.value)}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Annual Insurance</label>
            <div className="input-wrapper">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.insurance}
                onChange={(e) => handleChange('insurance', e.target.value)}
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
            <span>Home Insurance</span>
            <span>{formatCurrency(results.insurance)}</span>
          </div>
          <div className="breakdown-divider"></div>
          <div className="breakdown-item highlight">
            <span>Total Interest (Life of Loan)</span>
            <span>{formatCurrency(results.totalInterest)}</span>
          </div>
        </div>
        
        <div className="amortization-chart">
          <h4>Equity Growth Over Time</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={amortizationData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="equity" stroke="#0f172a" fill="url(#equityGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const VehicleCalculator = () => {
  const [inputs, setInputs] = useState({
    vehiclePrice: 35000,
    downPayment: 5000,
    years: 5,
    financeRate: 5.9,
    financeTerm: 60,
    resaleValue: 18000,
    leasePayment: 399,
    leaseTerm: 36,
    leaseFees: 2500,
  });
  
  const results = useMemo(() => {
    // Cash calculation
    const cashTotal = inputs.vehiclePrice - inputs.resaleValue;
    
    // Finance calculation
    const financeAmount = inputs.vehiclePrice - inputs.downPayment;
    const monthlyRate = inputs.financeRate / 100 / 12;
    const financePayment = financeAmount * (monthlyRate * Math.pow(1 + monthlyRate, inputs.financeTerm)) / (Math.pow(1 + monthlyRate, inputs.financeTerm) - 1);
    const financeTotalPaid = inputs.downPayment + (financePayment * inputs.financeTerm);
    const financeTotal = financeTotalPaid - inputs.resaleValue;
    
    // Lease calculation
    const leaseOneTerm = inputs.leaseFees + (inputs.leasePayment * inputs.leaseTerm);
    const numLeases = Math.ceil((inputs.years * 12) / inputs.leaseTerm);
    const leaseTotal = leaseOneTerm * numLeases;
    
    return {
      cash: { total: cashTotal, monthly: cashTotal / (inputs.years * 12) },
      finance: { total: financeTotal, monthly: financePayment, payment: financePayment },
      lease: { total: leaseTotal, monthly: inputs.leasePayment, oneTerm: leaseOneTerm },
      winner: cashTotal <= financeTotal && cashTotal <= leaseTotal ? 'cash' : 
              financeTotal <= leaseTotal ? 'finance' : 'lease'
    };
  }, [inputs]);
  
  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };
  
  return (
    <div className="vehicle-calculator">
      <div className="vehicle-inputs">
        <div className="input-group">
          <label>Vehicle Price (MSRP)</label>
          <div className="input-wrapper">
            <DollarSign size={16} />
            <input
              type="number"
              value={inputs.vehiclePrice}
              onChange={(e) => handleChange('vehiclePrice', e.target.value)}
            />
          </div>
        </div>
        
        <div className="input-row">
          <div className="input-group">
            <label>Down Payment</label>
            <div className="input-wrapper">
              <DollarSign size={16} />
              <input
                type="number"
                value={inputs.downPayment}
                onChange={(e) => handleChange('downPayment', e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Years to Compare</label>
            <div className="input-wrapper">
              <Calendar size={16} />
              <input
                type="number"
                value={inputs.years}
                onChange={(e) => handleChange('years', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="vehicle-options">
        <div className={`vehicle-option ${results.winner === 'cash' ? 'winner' : ''}`}>
          <div className="option-header">
            <Wallet size={24} />
            <h4>Buy Cash</h4>
            {results.winner === 'cash' && <span className="winner-badge">Best Value</span>}
          </div>
          <div className="option-price">{formatCurrency(results.cash.total)}</div>
          <div className="option-subtitle">Total cost over {inputs.years} years</div>
          <div className="option-detail">
            <span>Effective Monthly</span>
            <span>{formatCurrency(results.cash.monthly)}</span>
          </div>
          <div className="option-detail">
            <span>Resale Value</span>
            <span>{formatCurrency(inputs.resaleValue)}</span>
          </div>
          <div className="option-pros">
            <Check size={14} /> Own outright immediately
            <br /><Check size={14} /> No interest payments
            <br /><Check size={14} /> Full flexibility
          </div>
        </div>
        
        <div className={`vehicle-option ${results.winner === 'finance' ? 'winner' : ''}`}>
          <div className="option-header">
            <Building size={24} />
            <h4>Finance</h4>
            {results.winner === 'finance' && <span className="winner-badge">Best Value</span>}
          </div>
          <div className="option-price">{formatCurrency(results.finance.total)}</div>
          <div className="option-subtitle">Total cost over {inputs.years} years</div>
          <div className="option-detail">
            <span>Monthly Payment</span>
            <span>{formatCurrency(results.finance.payment)}</span>
          </div>
          <div className="option-detail">
            <span>Interest Rate</span>
            <span>{inputs.financeRate}% APR</span>
          </div>
          <div className="option-pros">
            <Check size={14} /> Build equity over time
            <br /><Check size={14} /> Keep cash available
            <br /><Check size={14} /> Own after payoff
          </div>
        </div>
        
        <div className={`vehicle-option ${results.winner === 'lease' ? 'winner' : ''}`}>
          <div className="option-header">
            <Key size={24} />
            <h4>Lease</h4>
            {results.winner === 'lease' && <span className="winner-badge">Best Value</span>}
          </div>
          <div className="option-price">{formatCurrency(results.lease.total)}</div>
          <div className="option-subtitle">Total cost over {inputs.years} years</div>
          <div className="option-detail">
            <span>Monthly Payment</span>
            <span>{formatCurrency(inputs.leasePayment)}</span>
          </div>
          <div className="option-detail">
            <span>Per {inputs.leaseTerm}-mo Term</span>
            <span>{formatCurrency(results.lease.oneTerm)}</span>
          </div>
          <div className="option-pros">
            <Check size={14} /> Lower monthly payments
            <br /><Check size={14} /> New car every few years
            <br /><AlertTriangle size={14} className="con" /> No ownership
          </div>
        </div>
      </div>
    </div>
  );
};

const RetirementCalculator = () => {
  const [inputs, setInputs] = useState({
    currentAge: 35,
    retireAge: 65,
    lifeExpectancy: 90,
    currentSavings: 75000,
    monthlyContribution: 1000,
    returnBefore: 7,
    returnDuring: 5,
    desiredIncome: 5000,
    socialSecurity: 2000,
  });
  
  const results = useMemo(() => {
    const yearsToRetire = inputs.retireAge - inputs.currentAge;
    const yearsInRetirement = inputs.lifeExpectancy - inputs.retireAge;
    
    // Accumulation phase
    const monthlyReturn = inputs.returnBefore / 100 / 12;
    const months = yearsToRetire * 12;
    const projectedSavings = inputs.currentSavings * Math.pow(1 + monthlyReturn, months) + 
                            inputs.monthlyContribution * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
    
    // Distribution phase
    const monthlyReturnDuring = inputs.returnDuring / 100 / 12;
    const retirementMonths = yearsInRetirement * 12;
    const monthlyWithdrawal = projectedSavings * (monthlyReturnDuring * Math.pow(1 + monthlyReturnDuring, retirementMonths)) / (Math.pow(1 + monthlyReturnDuring, retirementMonths) - 1);
    
    const totalMonthlyIncome = monthlyWithdrawal + inputs.socialSecurity;
    
    // Progress
    const neededForGoal = (inputs.desiredIncome - inputs.socialSecurity) * ((Math.pow(1 + monthlyReturnDuring, retirementMonths) - 1) / (monthlyReturnDuring * Math.pow(1 + monthlyReturnDuring, retirementMonths)));
    const progress = (projectedSavings / neededForGoal) * 100;
    
    // Generate projection data
    const projectionData = [];
    let savings = inputs.currentSavings;
    for (let age = inputs.currentAge; age <= inputs.lifeExpectancy; age++) {
      if (age < inputs.retireAge) {
        savings = savings * (1 + inputs.returnBefore / 100) + inputs.monthlyContribution * 12;
      } else {
        const withdrawal = (inputs.desiredIncome - inputs.socialSecurity) * 12;
        savings = savings * (1 + inputs.returnDuring / 100) - withdrawal;
      }
      projectionData.push({ age, savings: Math.max(0, savings) });
    }
    
    return {
      projectedSavings,
      monthlyIncome: totalMonthlyIncome,
      yearsInRetirement,
      progress: Math.min(progress, 200),
      projectionData,
      onTrack: progress >= 100,
    };
  }, [inputs]);
  
  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };
  
  return (
    <div className="retirement-calculator">
      <div className="retirement-inputs">
        <div className="input-section">
          <h4>Your Information</h4>
          <div className="input-row">
            <div className="input-group">
              <label>Current Age</label>
              <input type="number" value={inputs.currentAge} onChange={(e) => handleChange('currentAge', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Retirement Age</label>
              <input type="number" value={inputs.retireAge} onChange={(e) => handleChange('retireAge', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Life Expectancy</label>
              <input type="number" value={inputs.lifeExpectancy} onChange={(e) => handleChange('lifeExpectancy', e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="input-section">
          <h4>Savings</h4>
          <div className="input-row">
            <div className="input-group">
              <label>Current Savings</label>
              <div className="input-wrapper">
                <DollarSign size={16} />
                <input type="number" value={inputs.currentSavings} onChange={(e) => handleChange('currentSavings', e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label>Monthly Contribution</label>
              <div className="input-wrapper">
                <DollarSign size={16} />
                <input type="number" value={inputs.monthlyContribution} onChange={(e) => handleChange('monthlyContribution', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="input-section">
          <h4>Assumptions</h4>
          <div className="input-row">
            <div className="input-group">
              <label>Pre-Retirement Return</label>
              <div className="input-wrapper">
                <Percent size={16} />
                <input type="number" step="0.5" value={inputs.returnBefore} onChange={(e) => handleChange('returnBefore', e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label>Post-Retirement Return</label>
              <div className="input-wrapper">
                <Percent size={16} />
                <input type="number" step="0.5" value={inputs.returnDuring} onChange={(e) => handleChange('returnDuring', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>Desired Monthly Income</label>
              <div className="input-wrapper">
                <DollarSign size={16} />
                <input type="number" value={inputs.desiredIncome} onChange={(e) => handleChange('desiredIncome', e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label>Expected Social Security</label>
              <div className="input-wrapper">
                <DollarSign size={16} />
                <input type="number" value={inputs.socialSecurity} onChange={(e) => handleChange('socialSecurity', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="retirement-results">
        <div className="retirement-hero">
          <div className="retirement-stat main">
            <span className="label">Projected at Retirement</span>
            <span className="value">{formatCurrency(results.projectedSavings)}</span>
            <span className="subtitle">At age {inputs.retireAge}</span>
          </div>
          <div className="retirement-stat">
            <span className="label">Monthly Income</span>
            <span className="value">{formatCurrency(results.monthlyIncome)}</span>
          </div>
          <div className="retirement-stat">
            <span className="label">Years Covered</span>
            <span className="value">{results.yearsInRetirement}+</span>
          </div>
        </div>
        
        <div className="progress-section">
          <div className="progress-header">
            <span>Goal Progress</span>
            <span className={results.onTrack ? 'on-track' : 'behind'}>{results.progress.toFixed(0)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(results.progress, 100)}%` }}></div>
          </div>
          <div className={`progress-status ${results.onTrack ? 'success' : 'warning'}`}>
            {results.onTrack ? (
              <><Check size={16} /> You're on track to meet your retirement goals!</>
            ) : (
              <><AlertTriangle size={16} /> Consider increasing contributions to meet your goal</>
            )}
          </div>
        </div>
        
        <div className="projection-chart">
          <h4>Wealth Projection</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={results.projectionData}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="savings" stroke="#10b981" fill="url(#savingsGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// File Upload Component
const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };
  
  const handleFiles = (newFiles) => {
    const processed = newFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'analyzing',
      type: file.type,
    }));
    setFiles(prev => [...prev, ...processed]);
    
    // Simulate analysis
    setTimeout(() => {
      setFiles(prev => prev.map(f => ({ ...f, status: 'complete' })));
    }, 2000);
  };
  
  return (
    <div className="upload-section">
      <div className="security-badge">
        <Shield size={16} />
        <span>Bank-level encryption • Your data never leaves your device</span>
      </div>
      
      <div 
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept=".pdf,.csv,.ofx,.qfx"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(Array.from(e.target.files))}
        />
        <div className="upload-icon">
          <Upload size={32} />
        </div>
        <h3>Drop files here or click to browse</h3>
        <p>Supports PDF, CSV, OFX, and QFX files up to 10MB</p>
      </div>
      
      {files.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files</h4>
          {files.map((file, idx) => (
            <div key={idx} className="file-item">
              <FileText size={20} />
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <span className={`file-status ${file.status}`}>
                {file.status === 'analyzing' ? 'Analyzing...' : 'Complete ✓'}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="supported-formats">
        <h4>Supported Formats</h4>
        <div className="format-grid">
          <div className="format-item">
            <CreditCard size={24} />
            <span>Credit Card Statements</span>
            <small>PDF or CSV exports</small>
          </div>
          <div className="format-item">
            <Building size={24} />
            <span>Bank Statements</span>
            <small>PDF exports from your bank</small>
          </div>
          <div className="format-item">
            <FileText size={24} />
            <span>Transaction Exports</span>
            <small>OFX/QFX from financial apps</small>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App
export default function ClearPathFinance() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload Statements', icon: Upload },
    { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
    { id: 'spending', label: 'Spending Habits', icon: ShoppingCart },
    { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
    { id: 'investments', label: 'Investments', icon: PieIcon },
    { id: 'mortgage', label: 'Mortgage & Equity', icon: Home },
    { id: 'vehicle', label: 'Vehicle Calculator', icon: Car },
    { id: 'retirement', label: 'Retirement Planner', icon: Target },
    { id: 'savings', label: 'Savings Advice', icon: Lightbulb },
  ];
  
  const totalSubscriptions = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  
  return (
    <div className="app">
      <style>{`
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
          --accent-light: #334155;
          --success: #10b981;
          --success-bg: #ecfdf5;
          --warning: #f59e0b;
          --warning-bg: #fffbeb;
          --danger: #ef4444;
          --danger-bg: #fef2f2;
          --info: #3b82f6;
          --info-bg: #eff6ff;
          --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
          --shadow-lg: 0 12px 40px rgba(0,0,0,0.08);
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body {
          font-family: var(--font-sans);
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.5;
        }
        
        .app {
          display: flex;
          min-height: 100vh;
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
          transition: transform 0.3s ease;
        }
        
        .logo {
          padding: 0 24px 24px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .logo span {
          font-size: 0.8125rem;
          color: var(--text-muted);
          display: block;
          margin-top: 4px;
        }
        
        .nav-section {
          padding: 20px 12px 8px;
        }
        
        .nav-list {
          list-style: none;
        }
        
        .nav-item {
          margin-bottom: 2px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        
        .nav-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        
        .nav-link.active {
          background: var(--accent);
          color: white;
        }
        
        .nav-link svg {
          flex-shrink: 0;
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 32px 40px;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        
        .page-header {
          margin-bottom: 32px;
        }
        
        .page-header h2 {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        
        .page-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }
        
        /* Stat Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
          transition: all 0.2s ease;
        }
        
        .stat-card:hover {
          border-color: var(--border-dark);
          box-shadow: var(--shadow-md);
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
          color: var(--text-primary);
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
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
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
          border-radius: var(--radius-md);
          padding: 24px;
          margin-bottom: 24px;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card-title {
          font-size: 1.125rem;
          font-weight: 600;
        }
        
        /* Grid Layouts */
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        /* Insight Cards */
        .insight-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-radius: var(--radius-sm);
          margin-bottom: 12px;
          background: var(--bg-secondary);
          border-left: 3px solid var(--border-dark);
        }
        
        .insight-card.tip {
          background: var(--success-bg);
          border-left-color: var(--success);
        }
        
        .insight-card.warning {
          background: var(--warning-bg);
          border-left-color: var(--warning);
        }
        
        .insight-card.info {
          background: var(--info-bg);
          border-left-color: var(--info);
        }
        
        .insight-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.8);
        }
        
        .insight-card.tip .insight-icon { color: var(--success); }
        .insight-card.warning .insight-icon { color: var(--warning); }
        .insight-card.info .insight-icon { color: var(--info); }
        
        .insight-content h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .insight-content p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        
        .insight-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--accent);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        /* Subscription Items */
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
        
        .subscription-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .subscription-icon {
          width: 44px;
          height: 44px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }
        
        .subscription-name {
          font-weight: 600;
          font-size: 0.9375rem;
        }
        
        .subscription-meta {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        
        .subscription-warning {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--warning);
          margin-top: 4px;
        }
        
        .subscription-right {
          text-align: right;
        }
        
        .subscription-amount {
          font-size: 1.125rem;
          font-weight: 700;
        }
        
        .subscription-period {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        /* Charts */
        .chart-container {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 24px;
        }
        
        .chart-container h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 20px;
        }
        
        /* Calculator Styles */
        .calculator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        
        .calculator-inputs h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 24px;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0 14px;
          transition: all 0.15s ease;
        }
        
        .input-wrapper:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
        }
        
        .input-wrapper svg {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        
        .input-wrapper input {
          flex: 1;
          border: none;
          background: none;
          padding: 14px 0;
          font-size: 1rem;
          color: var(--text-primary);
          outline: none;
          font-family: inherit;
        }
        
        .input-hint {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 6px;
        }
        
        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .select-input {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          outline: none;
          font-family: inherit;
        }
        
        .select-input:focus {
          border-color: var(--accent);
        }
        
        /* Result Display */
        .result-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: var(--radius-md);
          padding: 32px;
          text-align: center;
          color: white;
          margin-bottom: 24px;
        }
        
        .result-label {
          font-size: 0.875rem;
          opacity: 0.8;
          display: block;
          margin-bottom: 8px;
        }
        
        .result-value {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        .result-subtitle {
          font-size: 0.8125rem;
          opacity: 0.7;
          margin-top: 8px;
          display: block;
        }
        
        .result-breakdown {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          font-size: 0.9375rem;
        }
        
        .breakdown-item.highlight {
          font-weight: 600;
        }
        
        .breakdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: 8px 0;
        }
        
        .amortization-chart {
          margin-top: 24px;
        }
        
        .amortization-chart h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        /* Vehicle Calculator */
        .vehicle-calculator {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        
        .vehicle-inputs {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 24px;
        }
        
        .vehicle-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        .vehicle-option {
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 24px;
          transition: all 0.2s ease;
        }
        
        .vehicle-option:hover {
          border-color: var(--border-dark);
        }
        
        .vehicle-option.winner {
          border-color: var(--success);
          background: var(--success-bg);
        }
        
        .option-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .option-header h4 {
          font-size: 1.125rem;
          font-weight: 600;
        }
        
        .winner-badge {
          margin-left: auto;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--success);
          color: white;
          padding: 4px 10px;
          border-radius: 100px;
        }
        
        .option-price {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .option-subtitle {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        
        .option-detail {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .option-pros {
          margin-top: 16px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 2;
        }
        
        .option-pros svg {
          color: var(--success);
          margin-right: 6px;
        }
        
        .option-pros svg.con {
          color: var(--warning);
        }
        
        /* Retirement Calculator */
        .retirement-calculator {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        
        .retirement-inputs {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .input-section {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        
        .input-section h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-secondary);
        }
        
        .input-section input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          background: var(--bg-primary);
          outline: none;
          font-family: inherit;
        }
        
        .input-section input:focus {
          border-color: var(--accent);
        }
        
        .retirement-results {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .retirement-hero {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
        }
        
        .retirement-stat {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 20px;
          text-align: center;
        }
        
        .retirement-stat.main {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
        }
        
        .retirement-stat .label {
          font-size: 0.8125rem;
          opacity: 0.8;
          display: block;
          margin-bottom: 8px;
        }
        
        .retirement-stat .value {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .retirement-stat.main .value {
          font-size: 2rem;
        }
        
        .retirement-stat .subtitle {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 4px;
        }
        
        .progress-section {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        .progress-header .on-track {
          color: var(--success);
        }
        
        .progress-header .behind {
          color: var(--warning);
        }
        
        .progress-bar {
          height: 8px;
          background: var(--border-color);
          border-radius: 100px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--success), #34d399);
          border-radius: 100px;
          transition: width 0.5s ease;
        }
        
        .progress-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          font-size: 0.875rem;
        }
        
        .progress-status.success {
          color: var(--success);
        }
        
        .progress-status.warning {
          color: var(--warning);
        }
        
        .projection-chart {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        
        .projection-chart h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        /* Upload Section */
        .upload-section {
          max-width: 800px;
        }
        
        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--success-bg);
          color: var(--success);
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 24px;
        }
        
        .upload-zone {
          border: 2px dashed var(--border-dark);
          border-radius: var(--radius-lg);
          padding: 60px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--bg-secondary);
        }
        
        .upload-zone:hover, .upload-zone.dragging {
          border-color: var(--accent);
          background: var(--bg-tertiary);
        }
        
        .upload-icon {
          width: 64px;
          height: 64px;
          background: var(--bg-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: var(--shadow-md);
        }
        
        .upload-zone h3 {
          font-size: 1.25rem;
          margin-bottom: 8px;
        }
        
        .upload-zone p {
          color: var(--text-muted);
        }
        
        .uploaded-files {
          margin-top: 32px;
        }
        
        .uploaded-files h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          margin-bottom: 8px;
        }
        
        .file-info {
          flex: 1;
        }
        
        .file-name {
          font-weight: 500;
          display: block;
        }
        
        .file-size {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
        
        .file-status {
          font-size: 0.8125rem;
          font-weight: 500;
        }
        
        .file-status.analyzing {
          color: var(--info);
        }
        
        .file-status.complete {
          color: var(--success);
        }
        
        .supported-formats {
          margin-top: 32px;
        }
        
        .supported-formats h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .format-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        .format-item {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 20px;
          text-align: center;
        }
        
        .format-item svg {
          margin-bottom: 12px;
          color: var(--text-secondary);
        }
        
        .format-item span {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .format-item small {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
        
        /* Quick Actions */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          font-family: inherit;
        }
        
        .quick-action-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-dark);
        }
        
        .quick-action-btn svg {
          flex-shrink: 0;
        }
        
        .quick-action-btn span {
          font-weight: 500;
        }
        
        /* Mobile Menu Button */
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
          box-shadow: var(--shadow-lg);
          align-items: center;
          justify-content: center;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .calculator-container,
          .retirement-calculator {
            grid-template-columns: 1fr;
          }
          
          .vehicle-options {
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
            grid-template-columns: 1fr;
          }
          
          .grid-2, .grid-3 {
            grid-template-columns: 1fr;
          }
          
          .page-header h2 {
            font-size: 1.5rem;
          }
          
          .retirement-hero {
            grid-template-columns: 1fr;
          }
          
          .input-row {
            grid-template-columns: 1fr;
          }
          
          .format-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      {/* Sidebar */}
      <nav className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="logo">
          <h1>ClearPath</h1>
          <span>Personal Financial Clarity</span>
        </div>
        
        <div className="nav-section">
          <ul className="nav-list">
            {navItems.map(item => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <>
            <header className="page-header">
              <h2>Dashboard</h2>
              <p>Your complete financial overview at a glance</p>
            </header>
            
            <div className="stats-grid">
              <StatCard
                title="Monthly Income"
                value="$8,450"
                trend="up"
                trendValue="+5.2%"
                icon={TrendingUp}
              />
              <StatCard
                title="Monthly Expenses"
                value="$5,230"
                trend="up"
                trendValue="+3.1%"
                icon={ShoppingCart}
              />
              <StatCard
                title="Net Cash Flow"
                value="$3,220"
                trend="up"
                trendValue="+8.7%"
                icon={DollarSign}
              />
              <StatCard
                title="Home Equity"
                value="$125K"
                trend="up"
                trendValue="+12.3%"
                icon={Home}
              />
            </div>
            
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Cash Flow Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlySpendingData}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="quick-actions">
                  <button className="quick-action-btn" onClick={() => setActiveSection('upload')}>
                    <Upload size={20} />
                    <span>Upload Statement</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveSection('mortgage')}>
                    <Calculator size={20} />
                    <span>Mortgage Calculator</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveSection('retirement')}>
                    <Target size={20} />
                    <span>Retirement Planner</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveSection('subscriptions')}>
                    <RefreshCw size={20} />
                    <span>Review Subscriptions</span>
                  </button>
                </div>
                
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Smart Insights</h4>
                  <InsightCard
                    type="tip"
                    title="Potential Savings Found"
                    description="You could save $127/month by switching car insurance providers."
                    action="Compare Rates"
                  />
                  <InsightCard
                    type="warning"
                    title="Subscription Alert"
                    description="3 streaming services total $47/month. Consider consolidating."
                    action="Review"
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Upload Section */}
        {activeSection === 'upload' && (
          <>
            <header className="page-header">
              <h2>Upload Statements</h2>
              <p>Securely upload your bank or credit card statements for analysis</p>
            </header>
            <FileUpload />
          </>
        )}
        
        {/* Cash Flow */}
        {activeSection === 'cashflow' && (
          <>
            <header className="page-header">
              <h2>Cash Flow Analysis</h2>
              <p>Understand where your money comes from and where it goes</p>
            </header>
            
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <StatCard title="Total Income" value="$8,450" icon={TrendingUp} />
              <StatCard title="Total Expenses" value="$5,230" icon={TrendingDown} />
              <StatCard title="Net Cash Flow" value="$3,220" icon={PiggyBank} />
            </div>
            
            <div className="grid-2">
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 20 }}>Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlySpendingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 20 }}>Spending by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
        
        {/* Spending Habits */}
        {activeSection === 'spending' && (
          <>
            <header className="page-header">
              <h2>Spending Habits</h2>
              <p>Track patterns and identify opportunities to optimize</p>
            </header>
            
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 20 }}>Monthly Spending Trends</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid-2">
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>Category Breakdown</h3>
                {spendingByCategory.map((cat, idx) => (
                  <div key={idx} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span>{cat.name}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(cat.value / 5230) * 100}%`, background: cat.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>Spending Insights</h3>
                <InsightCard
                  type="warning"
                  title="Dining Out Spike"
                  description="Dining expenses are up 23% from your 6-month average. Consider meal prepping to reduce costs."
                />
                <InsightCard
                  type="tip"
                  title="Transportation Savings"
                  description="Great job! Your transportation costs are down 6% this month."
                />
                <InsightCard
                  type="info"
                  title="Shopping Pattern"
                  description="You tend to spend more on weekends. Setting a weekend budget could help."
                />
              </div>
            </div>
          </>
        )}
        
        {/* Subscriptions */}
        {activeSection === 'subscriptions' && (
          <>
            <header className="page-header">
              <h2>Subscription Tracker</h2>
              <p>Monitor recurring charges and find opportunities to save</p>
            </header>
            
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <StatCard title="Monthly Total" value={formatCurrency(totalSubscriptions)} icon={RefreshCw} />
              <StatCard title="Annual Cost" value={formatCurrency(totalSubscriptions * 12)} icon={Calendar} />
              <StatCard title="Active Subscriptions" value={subscriptions.length.toString()} icon={Activity} />
            </div>
            
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Active Subscriptions</h3>
                </div>
                {subscriptions.map((sub, idx) => (
                  <SubscriptionItem key={idx} subscription={sub} />
                ))}
              </div>
              
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>Savings Opportunities</h3>
                <InsightCard
                  type="tip"
                  title="Streaming Bundle Opportunity"
                  description="Netflix + Hulu + Disney+ costs $47/month separately. Disney Bundle is $25/month - save $264/year."
                  action="Learn More"
                />
                <InsightCard
                  type="warning"
                  title="Unused Subscription Detected"
                  description="Your gym membership shows no activity in 45 days. Consider pausing to save $50/month."
                  action="Manage"
                />
                <InsightCard
                  type="info"
                  title="Annual vs Monthly"
                  description="Switching Spotify to annual billing would save $24/year."
                />
              </div>
            </div>
          </>
        )}
        
        {/* Investments */}
        {activeSection === 'investments' && (
          <>
            <header className="page-header">
              <h2>Investment Analysis</h2>
              <p>Track portfolio performance and analyze investment opportunities</p>
            </header>
            
            <div className="stats-grid">
              <StatCard title="Portfolio Value" value="$145,230" trend="up" trendValue="+12.4% YTD" icon={TrendingUp} />
              <StatCard title="401(k) Balance" value="$89,500" trend="up" trendValue="+8.2%" icon={Building} />
              <StatCard title="IRA Balance" value="$35,730" trend="up" trendValue="+15.1%" icon={PiggyBank} />
              <StatCard title="Brokerage" value="$20,000" trend="up" trendValue="+18.6%" icon={Activity} />
            </div>
            
            <div className="grid-2">
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 20 }}>Portfolio Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={investmentGrowthData}>
                    <defs>
                      <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="value" stroke="#0f172a" fill="url(#portfolioGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 20 }}>Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'US Stocks', value: 55, color: '#0f172a' },
                        { name: 'Int\'l Stocks', value: 20, color: '#334155' },
                        { name: 'Bonds', value: 15, color: '#64748b' },
                        { name: 'REITs', value: 10, color: '#94a3b8' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {[
                        { name: 'US Stocks', value: 55, color: '#0f172a' },
                        { name: 'Int\'l Stocks', value: 20, color: '#334155' },
                        { name: 'Bonds', value: 15, color: '#64748b' },
                        { name: 'REITs', value: 10, color: '#94a3b8' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
        
        {/* Mortgage Calculator */}
        {activeSection === 'mortgage' && (
          <>
            <header className="page-header">
              <h2>Mortgage & Home Equity</h2>
              <p>Understand your mortgage payments and build equity over time</p>
            </header>
            <MortgageCalculator />
          </>
        )}
        
        {/* Vehicle Calculator */}
        {activeSection === 'vehicle' && (
          <>
            <header className="page-header">
              <h2>Vehicle Calculator</h2>
              <p>Compare leasing, financing, or buying a vehicle outright</p>
            </header>
            <VehicleCalculator />
          </>
        )}
        
        {/* Retirement Planner */}
        {activeSection === 'retirement' && (
          <>
            <header className="page-header">
              <h2>Retirement Planner</h2>
              <p>Plan for a secure financial future</p>
            </header>
            <RetirementCalculator />
          </>
        )}
        
        {/* Savings Advice */}
        {activeSection === 'savings' && (
          <>
            <header className="page-header">
              <h2>Savings Advice</h2>
              <p>Personalized tips to help you save more money</p>
            </header>
            
            <div className="card" style={{ background: 'var(--success-bg)', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PiggyBank size={24} style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Potential Annual Savings: $3,840</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Based on our analysis, here are personalized recommendations</p>
                </div>
              </div>
            </div>
            
            <div className="grid-2" style={{ marginTop: 24 }}>
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>🏠 Housing</h3>
                <InsightCard
                  type="tip"
                  title="Refinance Opportunity"
                  description="If rates drop below 5.5%, refinancing could save you $200+/month. Set a rate alert."
                />
                <InsightCard
                  type="info"
                  title="Energy Audit"
                  description="A home energy audit ($200-400) often identifies $50-150/month in utility savings."
                />
              </div>
              
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>🚗 Transportation</h3>
                <InsightCard
                  type="tip"
                  title="Insurance Shopping"
                  description="Auto insurance rates vary 40%+ between providers. Get 3 quotes to potentially save $127/month."
                />
                <InsightCard
                  type="info"
                  title="Gas Rewards Programs"
                  description="Using grocery store fuel points could save $15-30/month on gas."
                />
              </div>
              
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>🛒 Shopping & Dining</h3>
                <InsightCard
                  type="warning"
                  title="Dining Out Budget"
                  description="You're spending $485/month on dining vs $395 average. Reducing by 2 meals/week saves ~$90/month."
                />
                <InsightCard
                  type="tip"
                  title="Cashback Optimization"
                  description="Using category-specific credit cards could earn an extra $30-50/month in rewards."
                />
              </div>
              
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: 16 }}>📱 Bills & Subscriptions</h3>
                <InsightCard
                  type="tip"
                  title="Negotiate Internet Bill"
                  description="Call your ISP about promotions. Average savings: $15-30/month with a 10-minute call."
                />
                <InsightCard
                  type="warning"
                  title="Unused Gym Membership"
                  description="No gym visits in 45 days. Pause or cancel to save $50/month."
                />
              </div>
            </div>
            
            <div className="card" style={{ marginTop: 24 }}>
              <h3 className="card-title" style={{ marginBottom: 8 }}>The 50/30/20 Rule</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>A popular budgeting framework to balance spending and savings</p>
              
              <div className="grid-3">
                <div style={{ textAlign: 'center', padding: 24, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>50%</div>
                  <div style={{ fontWeight: 600, margin: '8px 0' }}>Needs</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Housing, utilities, groceries, insurance</div>
                </div>
                <div style={{ textAlign: 'center', padding: 24, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>30%</div>
                  <div style={{ fontWeight: 600, margin: '8px 0' }}>Wants</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Dining, entertainment, shopping, hobbies</div>
                </div>
                <div style={{ textAlign: 'center', padding: 24, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>20%</div>
                  <div style={{ fontWeight: 600, margin: '8px 0' }}>Savings</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Emergency fund, retirement, investments</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
