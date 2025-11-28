import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { getTodos } from '../services/todoService';
import { getExpenses } from '../services/expenseService';
import { getIncomes } from '../services/incomeService';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', color: '#f97316' },
  { id: 'transport', name: 'Transport', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', color: '#ec4899' },
  { id: 'entertainment', name: 'Entertainment', color: '#8b5cf6' },
  { id: 'bills', name: 'Bills', color: '#ef4444' },
  { id: 'health', name: 'Health', color: '#10b981' },
  { id: 'education', name: 'Education', color: '#6366f1' },
  { id: 'other', name: 'Other', color: '#64748b' },
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', color: '#10b981' },
  { id: 'freelance', name: 'Freelance', color: '#3b82f6' },
  { id: 'business', name: 'Business', color: '#8b5cf6' },
  { id: 'investment', name: 'Investment', color: '#f59e0b' },
  { id: 'gift', name: 'Gift', color: '#ec4899' },
  { id: 'bonus', name: 'Bonus', color: '#06b6d4' },
  { id: 'other', name: 'Other', color: '#64748b' },
];

function Analytics() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [tasksData, expensesData, incomesData] = await Promise.all([
          getTodos(user.id),
          getExpenses(user.id),
          getIncomes(user.id)
        ]);
        setTasks(tasksData || []);
        setExpenses(expensesData || []);
        setIncomes(incomesData || []);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <LoadingSpinner message="Loading analytics..." />;

  // Task Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Expense Statistics
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const totalThisMonth = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const avgDaily = monthlyExpenses.length > 0 ? totalThisMonth / new Date().getDate() : 0;

  // Expense by Category
  const expenseByCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  })).filter(c => c.total > 0);

  // Income Statistics
  const totalIncomes = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const monthlyIncomes = incomes.filter(i => {
    const d = new Date(i.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const totalIncomeThisMonth = monthlyIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const avgDailyIncome = monthlyIncomes.length > 0 ? totalIncomeThisMonth / new Date().getDate() : 0;

  // Income by Category
  const incomeByCategory = INCOME_CATEGORIES.map(cat => ({
    ...cat,
    total: incomes.filter(i => i.category === cat.id).reduce((sum, i) => sum + parseFloat(i.amount || 0), 0)
  })).filter(c => c.total > 0);

  // Monthly Income Trend (last 6 months)
  const monthlyIncomeTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthIncomes = incomes.filter(inc => {
      const id = new Date(inc.date);
      return id.getMonth() === month && id.getFullYear() === year;
    });
    monthlyIncomeTrend.push({
      label: d.toLocaleString('default', { month: 'short' }),
      total: monthIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0)
    });
  }

  // Monthly Expense Trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthExpenses = expenses.filter(e => {
      const ed = new Date(e.date);
      return ed.getMonth() === month && ed.getFullYear() === year;
    });
    monthlyTrend.push({
      label: d.toLocaleString('default', { month: 'short' }),
      total: monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    });
  }

  // Task completion by week (last 4 weeks)
  const weeklyTasks = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekTasks = tasks.filter(t => {
      const created = new Date(t.created_at);
      return created >= weekStart && created <= weekEnd;
    });
    
    weeklyTasks.push({
      label: `Week ${4 - i}`,
      completed: weekTasks.filter(t => t.status === 'completed').length,
      total: weekTasks.length
    });
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#64748b' } },
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#64748b', padding: 12, usePointStyle: true } }
    }
  };

  // Task Chart Data
  const taskChartData = {
    labels: weeklyTasks.map(w => w.label),
    datasets: [{
      label: 'Completed',
      data: weeklyTasks.map(w => w.completed),
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderRadius: 6,
    }, {
      label: 'Total',
      data: weeklyTasks.map(w => w.total),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderRadius: 6,
    }]
  };

  // Expense Trend Chart Data
  const expenseTrendData = {
    labels: monthlyTrend.map(m => m.label),
    datasets: [{
      label: 'Expenses',
      data: monthlyTrend.map(m => m.total),
      borderColor: '#ec4899',
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#ec4899',
    }]
  };

  // Expense Category Chart Data
  const expenseCategoryData = {
    labels: expenseByCategory.map(c => c.name),
    datasets: [{
      data: expenseByCategory.map(c => c.total),
      backgroundColor: expenseByCategory.map(c => c.color),
      borderWidth: 0,
    }]
  };

  // Task Status Chart Data
  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'Upcoming'],
    datasets: [{
      data: [
        tasks.filter(t => t.status === 'completed').length,
        tasks.filter(t => t.status === 'ongoing').length,
        tasks.filter(t => t.status === 'upcoming' || t.status === 'pending').length,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
      borderWidth: 0,
    }]
  };

  // Income Trend Chart Data
  const incomeTrendData = {
    labels: monthlyIncomeTrend.map(m => m.label),
    datasets: [{
      label: 'Income',
      data: monthlyIncomeTrend.map(m => m.total),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#10b981',
    }]
  };

  // Income Category Chart Data
  const incomeCategoryData = {
    labels: incomeByCategory.map(c => c.name),
    datasets: [{
      data: incomeByCategory.map(c => c.total),
      backgroundColor: incomeByCategory.map(c => c.color),
      borderWidth: 0,
    }]
  };

  // Net Balance (Income vs Expense)
  const netBalance = totalIncomeThisMonth - totalThisMonth;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Analytics</h1>
          <p className="text-blue-600 text-sm mt-1">Insights into your activity</p>
        </div>
        <div className="flex gap-1 bg-white/70 border border-blue-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'tasks' ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <Icon name="tasks" className="w-4 h-4" /> Tasks
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'expenses' ? 'bg-rose-500 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <Icon name="wallet" className="w-4 h-4" /> Expenses
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <Icon name="trendUp" className="w-4 h-4" /> Income
          </button>
        </div>
      </div>

      {/* Task Analytics */}
      {activeTab === 'tasks' && (
        <>
          {/* Task Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="clipboard" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Total Tasks</p>
                  <p className="text-xl font-bold text-blue-900">{totalTasks}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="checkCircle" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Completed</p>
                  <p className="text-xl font-bold text-blue-900">{completedTasks}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="clock" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Pending</p>
                  <p className="text-xl font-bold text-blue-900">{pendingTasks}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="trendUp" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Completion Rate</p>
                  <p className="text-xl font-bold text-blue-900">{completionRate}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Task Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Weekly Progress</h3>
              <div className="h-64">
                <Bar 
                  options={{...chartOptions, plugins: { legend: { display: true, position: 'top' } }}} 
                  data={taskChartData} 
                />
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Task Status</h3>
              <div className="h-64">
                <Doughnut data={taskStatusData} options={doughnutOptions} />
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Expense Analytics */}
      {activeTab === 'expenses' && (
        <>
          {/* Expense Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="wallet" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Total All Time</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="calendar" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">This Month</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(totalThisMonth)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="trendUp" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Daily Average</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(avgDaily)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="clipboard" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Transactions</p>
                  <p className="text-xl font-bold text-blue-900">{expenses.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Expense Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Monthly Trend</h3>
              <div className="h-64">
                <Line options={chartOptions} data={expenseTrendData} />
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">By Category</h3>
              <div className="h-64">
                {expenseByCategory.length > 0 ? (
                  <Doughnut data={expenseCategoryData} options={doughnutOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-blue-400">
                    No expense data
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Top Categories */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Top Spending Categories</h3>
            <div className="space-y-3">
              {expenseByCategory
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
                .map((cat, i) => {
                  const percentage = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-medium text-blue-500">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-blue-900">{cat.name}</span>
                          <span className="text-sm font-bold text-blue-900">{formatCurrency(cat.total)}</span>
                        </div>
                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all" 
                            style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-blue-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              {expenseByCategory.length === 0 && (
                <p className="text-center text-blue-400 py-8">No expense data yet</p>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Income Analytics */}
      {activeTab === 'income' && (
        <>
          {/* Income Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="wallet" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Total All Time</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(totalIncomes)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="calendar" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">This Month</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(totalIncomeThisMonth)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white shadow-sm">
                  <Icon name="trendUp" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Daily Average</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(avgDailyIncome)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${netBalance >= 0 ? 'from-emerald-400 to-emerald-500' : 'from-rose-400 to-rose-500'} flex items-center justify-center text-white shadow-sm`}>
                  <Icon name={netBalance >= 0 ? 'trendUp' : 'trendDown'} className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-blue-500 text-xs">Net Balance</p>
                  <p className={`text-lg font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(netBalance)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Income Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Monthly Trend</h3>
              <div className="h-64">
                <Line options={chartOptions} data={incomeTrendData} />
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">By Category</h3>
              <div className="h-64">
                {incomeByCategory.length > 0 ? (
                  <Doughnut data={incomeCategoryData} options={doughnutOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-blue-400">
                    No income data
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Top Income Sources */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Top Income Sources</h3>
            <div className="space-y-3">
              {incomeByCategory
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
                .map((cat, i) => {
                  const percentage = totalIncomes > 0 ? (cat.total / totalIncomes) * 100 : 0;
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-medium text-blue-500">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-blue-900">{cat.name}</span>
                          <span className="text-sm font-bold text-emerald-600">{formatCurrency(cat.total)}</span>
                        </div>
                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all" 
                            style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-blue-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              {incomeByCategory.length === 0 && (
                <p className="text-center text-blue-400 py-8">No income data yet</p>
              )}
            </div>
          </Card>

          {/* Income vs Expense Comparison */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Income vs Expense (This Month)</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-600">Income</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalIncomeThisMonth)}</span>
                </div>
                <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all" 
                    style={{ width: `${Math.min((totalIncomeThisMonth / Math.max(totalIncomeThisMonth, totalThisMonth)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-rose-600">Expense</span>
                  <span className="text-sm font-bold text-rose-600">{formatCurrency(totalThisMonth)}</span>
                </div>
                <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all" 
                    style={{ width: `${Math.min((totalThisMonth / Math.max(totalIncomeThisMonth, totalThisMonth)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-blue-100">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-blue-900">Net Balance</span>
                  <span className={`text-sm font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default Analytics;
