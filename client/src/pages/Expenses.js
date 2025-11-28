import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { getExpenses, addExpense, deleteExpense } from '../services/expenseService';
import { getIncomes, addIncome, deleteIncome } from '../services/incomeService';

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Drinks', icon: '🍔', color: 'from-orange-400 to-orange-500' },
  { id: 'transport', name: 'Transportation', icon: '🚗', color: 'from-blue-400 to-blue-500' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', color: 'from-pink-400 to-pink-500' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'from-purple-400 to-purple-500' },
  { id: 'bills', name: 'Bills & Utilities', icon: '📄', color: 'from-red-400 to-red-500' },
  { id: 'health', name: 'Health', icon: '💊', color: 'from-green-400 to-green-500' },
  { id: 'education', name: 'Education', icon: '📚', color: 'from-indigo-400 to-indigo-500' },
  { id: 'other', name: 'Other', icon: '📦', color: 'from-gray-400 to-gray-500' },
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: '💼', color: 'from-emerald-400 to-emerald-500' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: 'from-blue-400 to-blue-500' },
  { id: 'business', name: 'Business', icon: '🏪', color: 'from-amber-400 to-amber-500' },
  { id: 'investment', name: 'Investment', icon: '📈', color: 'from-green-400 to-green-500' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: 'from-pink-400 to-pink-500' },
  { id: 'refund', name: 'Refund', icon: '💸', color: 'from-cyan-400 to-cyan-500' },
  { id: 'bonus', name: 'Bonus', icon: '🎉', color: 'from-yellow-400 to-yellow-500' },
  { id: 'other', name: 'Other', icon: '💰', color: 'from-gray-400 to-gray-500' },
];

// Format number to IDR with thousand separator
const formatInputCurrency = (value) => {
  const num = value.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse formatted currency back to number
const parseCurrency = (value) => {
  return parseInt(value.replace(/\./g, ''), 10) || 0;
};

function Finance() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('expense');
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    amount: '',
    displayAmount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const [expensesData, incomesData] = await Promise.all([
        getExpenses(user.id),
        getIncomes(user.id)
      ]);
      setExpenses(expensesData || []);
      setIncomes(incomesData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const openModal = (type) => {
    setModalType(type);
    setNewEntry({
      amount: '',
      displayAmount: '',
      category: type === 'expense' ? 'food' : 'salary',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleAmountChange = (e) => {
    const input = e.target.value;
    const formatted = formatInputCurrency(input);
    const numericValue = parseCurrency(formatted);
    setNewEntry({ 
      ...newEntry, 
      displayAmount: formatted,
      amount: numericValue
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEntry.amount || !newEntry.category) {
      showToast('Please fill required fields', 'error');
      return;
    }

    if (!user?.id) {
      showToast('Please login first', 'error');
      return;
    }

    setSaving(true);
    const entryData = {
      amount: newEntry.amount,
      category: newEntry.category,
      description: newEntry.description,
      date: newEntry.date,
    };

    if (modalType === 'expense') {
      const result = await addExpense(user.id, entryData);
      if (result.success) {
        setExpenses([result.data, ...expenses]);
        showToast('Expense added');
      } else {
        showToast(result.error || 'Failed to add expense', 'error');
        setSaving(false);
        return;
      }
    } else {
      const result = await addIncome(user.id, entryData);
      if (result.success) {
        setIncomes([result.data, ...incomes]);
        showToast('Income added');
      } else {
        showToast(result.error || 'Failed to add income', 'error');
        setSaving(false);
        return;
      }
    }

    setShowModal(false);
    setSaving(false);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    const result = await deleteExpense(id);
    if (result.success) {
      setExpenses(expenses.filter(e => e.id !== id));
      showToast('Expense deleted');
    } else {
      showToast(result.error || 'Failed to delete', 'error');
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Delete this income?')) return;
    const result = await deleteIncome(id);
    if (result.success) {
      setIncomes(incomes.filter(i => i.id !== id));
      showToast('Income deleted');
    } else {
      showToast(result.error || 'Failed to delete', 'error');
    }
  };

  // Filter by month
  const filteredExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    const matchMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    const matchCategory = filter === 'all' || e.category === filter;
    return matchMonth && matchCategory;
  });

  const filteredIncomes = incomes.filter(i => {
    const date = new Date(i.date);
    const matchMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    const matchCategory = filter === 'all' || i.category === filter;
    return matchMonth && matchCategory;
  });

  // Calculate totals
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const getCategoryInfo = (categoryId, type) => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  };

  if (loading) return <LoadingSpinner message="Loading finance data..." />;

  const currentCategories = activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const currentData = activeTab === 'expense' ? filteredExpenses : filteredIncomes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Finance</h1>
          <p className="text-blue-600 text-sm mt-1">Manage your income & expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openModal('income')} className="!bg-emerald-500 !text-white hover:!bg-emerald-600">
            <Icon name="plus" className="w-4 h-4" />
            Income
          </Button>
          <Button onClick={() => openModal('expense')}>
            <Icon name="plus" className="w-4 h-4" />
            Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <Icon name="trendUp" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-500">Income</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Icon name="wallet" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-500">Expense</p>
              <p className="text-xl font-bold text-rose-600">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${balance >= 0 ? 'from-blue-400 to-blue-500' : 'from-red-400 to-red-500'} flex items-center justify-center text-white shadow-md`}>
              <Icon name="dollarSign" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-500">Balance</p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Month Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
          >
            <Icon name="chevronLeft" className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm text-blue-500">Period</p>
            <p className="font-semibold text-blue-900">{monthName}</p>
          </div>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
          >
            <Icon name="chevronRight" className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/70 border border-blue-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setActiveTab('expense'); setFilter('all'); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Icon name="wallet" className="w-4 h-4" />
          Expenses ({filteredExpenses.length})
        </button>
        <button
          onClick={() => { setActiveTab('income'); setFilter('all'); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Icon name="trendUp" className="w-4 h-4" />
          Income ({filteredIncomes.length})
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
          }`}
        >
          All
        </button>
        {currentCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat.id ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          {activeTab === 'expense' ? 'Expenses' : 'Income'} ({currentData.length})
        </h3>
        
        {currentData.length > 0 ? (
          <div className="space-y-3">
            {currentData.map(item => {
              const cat = getCategoryInfo(item.category, activeTab);
              const isExpense = activeTab === 'expense';
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-white text-lg`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-900 truncate">
                      {item.description || cat.name}
                    </p>
                    <p className="text-xs text-blue-500">
                      {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
                    </p>
                  </div>
                  <button
                    onClick={() => isExpense ? handleDeleteExpense(item.id) : handleDeleteIncome(item.id)}
                    className="p-2 text-blue-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">{activeTab === 'expense' ? '💸' : '💰'}</div>
            <p className="text-blue-500">No {activeTab} recorded</p>
            <p className="text-blue-400 text-sm">Add your first {activeTab} to start tracking</p>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${modalType === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                <Icon name="plus" className="w-5 h-5" />
                Add {modalType === 'expense' ? 'Expense' : 'Income'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-blue-400 hover:text-blue-600 p-1 hover:bg-blue-100 rounded-lg">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-blue-700 mb-1">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 font-semibold">Rp</span>
                  <input
                    type="text"
                    value={newEntry.displayAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    required
                    className="w-full bg-blue-50 border border-blue-200 rounded-lg pl-10 pr-3 py-2.5 text-blue-900 text-lg font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-blue-700 mb-1">Category *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(modalType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, category: cat.id })}
                      className={`p-2 rounded-lg text-center transition-all ${
                        newEntry.category === cat.id
                          ? 'bg-blue-100 ring-2 ring-blue-400'
                          : 'bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <p className="text-xs text-blue-600 mt-1 truncate">{cat.name.split(' ')[0]}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-blue-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder={modalType === 'expense' ? 'What did you spend on?' : 'Income source'}
                  className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm text-blue-700 mb-1 flex items-center gap-1">
                  <Icon name="calendar" className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1" disabled={saving}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className={`flex-1 ${modalType === 'income' ? '!bg-emerald-500 hover:!bg-emerald-600' : ''}`} 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : <><Icon name="plus" className="w-4 h-4" /> Add</>}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg text-sm z-50 shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <Icon name={toast.type === 'success' ? 'checkCircle' : 'x'} className="w-4 h-4" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default Finance;
