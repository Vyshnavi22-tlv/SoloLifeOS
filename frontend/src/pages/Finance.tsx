import React, { useState, useRef } from 'react'
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'
import { BarChart, LineChart } from '../components/ui/Chart'

interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  description: string
  type: 'income' | 'expense'
  category: string
  amount: number
}

interface Budget {
  category: string
  limit: number
}

interface SavingsGoal {
  id: string
  name: string
  target: number
  saved: number
}

export const Finance: React.FC = () => {
  const { addToast } = useToastStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Seed Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't-1', date: '2026-07-15', description: 'Monthly Freelance Project', type: 'income', category: 'Freelance', amount: 2500 },
    { id: 't-2', date: '2026-07-16', description: 'Whole Foods Groceries', type: 'expense', category: 'Food', amount: 124.50 },
    { id: 't-3', date: '2026-07-16', description: 'Electric Bill Payment', type: 'expense', category: 'Utilities', amount: 85.00 },
    { id: 't-4', date: '2026-07-17', description: 'Office Chair', type: 'expense', category: 'Office', amount: 180.00 },
    { id: 't-5', date: '2026-07-17', description: 'Part-time Tutoring', type: 'income', category: 'Freelance', amount: 350.00 }
  ])

  // Seed Budgets
  const [budgets, setBudgets] = useState<Budget[]>([
    { category: 'Food', limit: 300 },
    { category: 'Utilities', limit: 150 },
    { category: 'Entertainment', limit: 100 },
    { category: 'Office', limit: 200 }
  ])

  // Seed Savings Goals
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    { id: 's-1', name: 'MacBook Pro Fund', target: 2000, saved: 1200 },
    { id: 's-2', name: 'Emergency Reserve', target: 5000, saved: 2500 }
  ])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('sololifeos_quick_expenses')
      if (stored) {
        const quickExps = JSON.parse(stored) as Transaction[]
        if (quickExps.length > 0) {
          setTransactions(prev => [...quickExps, ...prev])
          localStorage.removeItem('sololifeos_quick_expenses')
          addToast(`Imported ${quickExps.length} quick-added transactions!`, 'success')
        }
      }
    } catch {}
  }, [addToast])

  // View Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)

  // Transaction Form fields
  const [txDesc, setTxDesc] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txType, setTxType] = useState<'income' | 'expense'>('expense')
  const [txCategory, setTxCategory] = useState('Food')
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0])

  // Budget Form fields
  const [bgCategory, setBgCategory] = useState('Food')
  const [bgLimit, setBgLimit] = useState('')

  // Savings Goal Form fields
  const [sgName, setSgName] = useState('')
  const [sgTarget, setSgTarget] = useState('')
  const [sgSaved, setSgSaved] = useState('')

  // Computations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  const netSavings = totalIncome - totalExpense

  // Calculate expense sum per category to compare with budgets
  const getCategoryExpense = (category: string) => {
    return transactions
      .filter((t) => t.type === 'expense' && t.category === category)
      .reduce((acc, t) => acc + t.amount, 0)
  }

  // Count budgets exceeded
  const budgetsExceededCount = budgets.filter(
    (b) => getCategoryExpense(b.category) > b.limit
  ).length

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    return matchesSearch && matchesType
  })

  // List of unique categories for selectors
  const categoriesList = ['Food', 'Utilities', 'Entertainment', 'Office', 'Freelance', 'Rent', 'Travel']

  // Handlers
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(txAmount)
    if (!txDesc.trim() || isNaN(amountNum) || amountNum <= 0) {
      addToast('Please enter a valid description and amount', 'warning')
      return
    }

    const newTx: Transaction = {
      id: `t-${Math.random().toString(36).substr(2, 9)}`,
      date: txDate,
      description: txDesc,
      type: txType,
      category: txCategory,
      amount: amountNum
    }

    setTransactions([newTx, ...transactions])
    addToast('Transaction recorded successfully!', 'success')
    setIsTxModalOpen(false)

    // Check if new expense exceeds budget limit
    if (txType === 'expense') {
      const budget = budgets.find((b) => b.category === txCategory)
      if (budget) {
        const totalExp = getCategoryExpense(txCategory) + amountNum
        if (totalExp > budget.limit) {
          addToast(`[BUDGET WARNING]: ${txCategory} limit exceeded! Spent: $${totalExp}`, 'warning')
        }
      }
    }

    // Reset Form
    setTxDesc('')
    setTxAmount('')
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
    addToast('Transaction removed', 'error')
  }

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault()
    const limitNum = parseFloat(bgLimit)
    if (isNaN(limitNum) || limitNum <= 0) {
      addToast('Please enter a valid budget limit', 'warning')
      return
    }

    const exists = budgets.some((b) => b.category === bgCategory)
    if (exists) {
      setBudgets(budgets.map((b) => (b.category === bgCategory ? { ...b, limit: limitNum } : b)))
      addToast('Budget limit updated!', 'success')
    } else {
      setBudgets([...budgets, { category: bgCategory, limit: limitNum }])
      addToast('New category budget set!', 'success')
    }
    setIsBudgetModalOpen(false)
    setBgLimit('')
  }

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const targetNum = parseFloat(sgTarget)
    const savedNum = parseFloat(sgSaved)
    if (!sgName.trim() || isNaN(targetNum) || isNaN(savedNum) || targetNum <= 0) {
      addToast('Please enter a valid savings target', 'warning')
      return
    }

    const newGoal: SavingsGoal = {
      id: `s-${Math.random().toString(36).substr(2, 9)}`,
      name: sgName,
      target: targetNum,
      saved: savedNum
    }

    setSavingsGoals([...savingsGoals, newGoal])
    addToast('Savings goal saved!', 'success')
    setIsGoalModalOpen(false)
    setSgName('')
    setSgTarget('')
    setSgSaved('')
  }

  // CSV Import/Export Helpers
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Date,Description,Type,Category,Amount\n'
    transactions.forEach((t) => {
      csvContent += `${t.date},"${t.description}",${t.type},${t.category},${t.amount}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'sololifeos_transactions.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('CSV spreadsheet exported successfully!', 'success')
  }

  const triggerCSVImport = () => {
    fileInputRef.current?.click()
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (text) {
          try {
            const lines = text.split('\n')
            const newTxs: Transaction[] = []

            // Skip headers line 0
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim()
              if (line.length === 0) continue

              // Basic comma parser splitting quotes
              const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
              if (columns.length >= 5) {
                newTxs.push({
                  id: `t-${Math.random().toString(36).substr(2, 9)}`,
                  date: columns[0].replace(/"/g, ''),
                  description: columns[1].replace(/"/g, ''),
                  type: columns[2].replace(/"/g, '') as any,
                  category: columns[3].replace(/"/g, ''),
                  amount: parseFloat(columns[4])
                })
              }
            }

            if (newTxs.length > 0) {
              setTransactions([...newTxs, ...transactions])
              addToast(`Successfully imported ${newTxs.length} transactions!`, 'success')
            } else {
              addToast('No valid transactions found in CSV file', 'warning')
            }
          } catch {
            addToast('Error parsing CSV file format', 'error')
          }
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Finance Tracker 💵
          </h1>
          <p className="text-slate-500 mt-1">Track income flow, category expenses, and saving thresholds.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={triggerCSVImport} variant="secondary" size="sm" className="flex items-center gap-1">
            <Upload size={14} /> Import CSV
            <input type="file" ref={fileInputRef} onChange={handleCSVImport} accept=".csv" className="hidden" />
          </Button>
          <Button onClick={exportToCSV} variant="secondary" size="sm" className="flex items-center gap-1">
            <Download size={14} /> Export CSV
          </Button>
          <Button onClick={() => setIsTxModalOpen(true)} size="sm">
            <Plus size={14} /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: `$${totalIncome.toFixed(2)}`, icon: <ArrowUpRight className="text-emerald-500" size={16} /> },
          { label: 'Total Expenses', value: `$${totalExpense.toFixed(2)}`, icon: <ArrowDownRight className="text-rose-500" size={16} /> },
          { label: 'Net Savings', value: `$${netSavings.toFixed(2)}`, icon: <DollarSign className="text-sky-500" size={16} /> },
          { label: 'Budgets Exceeded', value: budgetsExceededCount, icon: <AlertCircle className="text-amber-500" size={16} /> }
        ].map((stat, idx) => (
          <Card key={idx} variant="white" className="flex items-center gap-4 p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className={`text-lg font-black mt-0.5 ${
                stat.label === 'Net Savings' && netSavings < 0 ? 'text-rose-500' : 'text-slate-800'
              }`}>{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left main transactions table ledger */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="white" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-sky-500" /> Transaction Ledger
              </h2>

              {/* Filters toolbar */}
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-44">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-3 py-1 bg-slate-50 border border-slate-200/50 rounded-xl text-[10px] focus:outline-hidden focus:ring-2 focus:ring-sky-300 text-slate-800"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200/50 rounded-xl text-[10px] focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expenses</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">No ledger items recorded.</td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/20 font-medium">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                        <td className="py-3 px-3 text-slate-800 font-bold truncate max-w-[150px]" title={t.description}>
                          {t.description}
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm text-[9px] font-extrabold uppercase">
                            {t.category}
                          </span>
                        </td>
                        <td className={`py-3 px-3 text-right font-black whitespace-nowrap ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Charts section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card variant="white" className="space-y-4">
              <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Expenses Category Breakdown</h3>
              <BarChart
                height={120}
                data={budgets.map((b) => ({
                  label: b.category,
                  value: getCategoryExpense(b.category)
                }))}
              />
            </Card>
            <Card variant="white" className="space-y-4">
              <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Net Cashflow Trend</h3>
              <LineChart
                height={120}
                data={[
                  { label: 'Income', value: totalIncome },
                  { label: 'Expenses', value: totalExpense },
                  { label: 'Net', value: netSavings }
                ]}
              />
            </Card>
          </div>
        </div>

        {/* Right column budgets and savings targets panels */}
        <div className="space-y-6">
          {/* Active category budgets */}
          <Card variant="white" className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={14} className="text-indigo-500" /> Category Budgets
              </h3>
              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className="text-[10px] text-sky-500 font-extrabold hover:text-sky-600 cursor-pointer"
              >
                + Configure
              </button>
            </div>

            <div className="space-y-3.5">
              {budgets.map((b) => {
                const spent = getCategoryExpense(b.category)
                const percent = Math.min(100, Math.round((spent / b.limit) * 100))
                const exceeded = spent > b.limit

                return (
                  <div key={b.category} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-700">{b.category}</span>
                      <span className={exceeded ? 'text-rose-500 font-black' : 'text-slate-500'}>
                        ${spent.toFixed(0)} / ${b.limit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          exceeded ? 'bg-rose-500 animate-pulse' : 'bg-sky-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Savings Goals progress */}
          <Card variant="white" className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                <TrendingUp size={14} className="text-emerald-500" /> Savings Targets
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="text-[10px] text-sky-500 font-extrabold hover:text-sky-600 cursor-pointer"
              >
                + Add Goal
              </button>
            </div>

            <div className="space-y-4">
              {savingsGoals.map((g) => {
                const percent = Math.round((g.saved / g.target) * 100)
                return (
                  <div key={g.id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{g.name}</span>
                      <span>${g.saved} / ${g.target} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-400 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction Modal */}
      <Dialog
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title="Add Cash Transaction 💸"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsTxModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTransaction} variant="primary">Record Transaction</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          <Input
            label="Transaction Description"
            placeholder="Whole foods, tutoring, utility bill..."
            value={txDesc}
            onChange={(e) => setTxDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount ($)"
              placeholder="45.00"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Flow Type"
              value={txType}
              onChange={(e) => setTxType(e.target.value as any)}
              options={[
                { value: 'expense', label: 'Expense Outflow' },
                { value: 'income', label: 'Income Inflow' }
              ]}
            />
            <Select
              label="Category"
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              options={categoriesList.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </form>
      </Dialog>

      {/* Budget Limit Config Modal */}
      <Dialog
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Configure Category Budget ⚙️"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsBudgetModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBudget} variant="primary">Set Limit</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <Select
            label="Select Category"
            value={bgCategory}
            onChange={(e) => setBgCategory(e.target.value)}
            options={categoriesList.map((c) => ({ value: c, label: c }))}
          />
          <Input
            label="Monthly Limit ($)"
            placeholder="500"
            value={bgLimit}
            onChange={(e) => setBgLimit(e.target.value)}
          />
        </form>
      </Dialog>

      {/* Savings Goal Modal */}
      <Dialog
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Create Savings Goal 🎯"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGoal} variant="primary">Save Goal</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Goal Name"
            placeholder="Emergency reserve, laptop, travel fund..."
            value={sgName}
            onChange={(e) => setSgName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Goal ($)"
              placeholder="3000"
              value={sgTarget}
              onChange={(e) => setSgTarget(e.target.value)}
            />
            <Input
              label="Currently Saved ($)"
              placeholder="500"
              value={sgSaved}
              onChange={(e) => setSgSaved(e.target.value)}
            />
          </div>
        </form>
      </Dialog>
    </div>
  )
}
