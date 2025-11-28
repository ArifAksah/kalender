import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTodos } from '../services/todoService';
import { getExpenses } from '../services/expenseService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskCalendar from '../components/TaskCalendar';
import Icon from '../components/Icons';

const EXPENSE_CATEGORIES = {
  food: { name: 'Food & Drinks', icon: '🍔' },
  transport: { name: 'Transportation', icon: '🚗' },
  shopping: { name: 'Shopping', icon: '🛒' },
  entertainment: { name: 'Entertainment', icon: '🎬' },
  bills: { name: 'Bills & Utilities', icon: '📄' },
  health: { name: 'Health', icon: '💊' },
  education: { name: 'Education', icon: '📚' },
  other: { name: 'Other', icon: '📦' },
};

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const [todosData, expensesData] = await Promise.all([
          getTodos(user.id),
          getExpenses(user.id)
        ]);
        setTasks(todosData || []);
        setExpenses(expensesData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setTasks([]);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleDateClick = (date, dateTasks, dateExpenses) => {
    setSelectedDate(date);
    setSelectedTasks(dateTasks || []);
    setSelectedExpenses(dateExpenses || []);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedTasks([]);
    setSelectedExpenses([]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  // Calculate stats from tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: 'clipboard', color: 'from-blue-400 to-blue-500' },
    { label: 'Completed', value: completedTasks, icon: 'checkCircle', color: 'from-emerald-400 to-emerald-500' },
    { label: 'Pending', value: pendingTasks, icon: 'clock', color: 'from-amber-400 to-amber-500' },
    { label: 'Expenses', value: expenses.length, icon: 'wallet', color: 'from-rose-400 to-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Welcome, {user?.name || user?.username || 'User'}</h1>
          <p className="text-blue-600 text-sm mt-1">Here's your progress overview</p>
        </div>
        <Button onClick={() => navigate('/todo')}>
          <Icon name="plus" className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-sm`}>
                <Icon name={stat.icon} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-blue-500 text-xs">{stat.label}</p>
                <p className="text-xl font-bold text-blue-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Calendar & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <TaskCalendar tasks={tasks} expenses={expenses} onDateClick={handleDateClick} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/todo')}>
              <Icon name="tasks" className="w-4 h-4" /> View Tasks
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/expenses')}>
              <Icon name="wallet" className="w-4 h-4" /> Expenses
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/analytics')}>
              <Icon name="analytics" className="w-4 h-4" /> Analytics
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/achievements')}>
              <Icon name="trophy" className="w-4 h-4" /> Achievements
            </Button>
          </div>

          {/* Upcoming Tasks */}
          <div className="mt-6 pt-4 border-t border-blue-100">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Icon name="calendar" className="w-4 h-4 text-blue-500" />
              Upcoming Tasks
            </h4>
            <div className="space-y-2">
              {tasks
                .filter(t => t.status !== 'completed' && t.due_date)
                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                .slice(0, 3)
                .map(task => (
                  <div key={task.id} className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium truncate">{task.title}</p>
                    <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                      <Icon name="clock" className="w-3 h-3" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              }
              {tasks.filter(t => t.status !== 'completed' && t.due_date).length === 0 && (
                <p className="text-sm text-blue-400 text-center py-2">No upcoming tasks</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Task & Expense Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm" onClick={closeModal}>
          <Card className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Icon name="calendar" className="w-5 h-5 text-blue-500" />
                  {formatDate(selectedDate)}
                </h2>
                <p className="text-sm text-blue-500">
                  {selectedTasks.length} task(s), {selectedExpenses.length} expense(s)
                </p>
              </div>
              <button onClick={closeModal} className="text-blue-400 hover:text-blue-600 p-1 hover:bg-blue-100 rounded-lg transition-colors">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {/* Tasks Section */}
              {selectedTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <Icon name="tasks" className="w-4 h-4" />
                    Tasks
                  </h4>
                  <div className="space-y-2">
                    {selectedTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-3 rounded-lg border ${
                          task.status === 'completed' 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : task.status === 'ongoing'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm ${task.status === 'completed' ? 'text-emerald-700 line-through' : 'text-blue-900'}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-blue-500 mt-1 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : task.status === 'ongoing'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expenses Section */}
              {selectedExpenses.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-rose-600 mb-2 flex items-center gap-2">
                    <Icon name="wallet" className="w-4 h-4" />
                    Expenses
                  </h4>
                  <div className="space-y-2">
                    {selectedExpenses.map(expense => {
                      const cat = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.other;
                      return (
                        <div key={expense.id} className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-lg">{cat.icon}</span>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-rose-800 truncate">
                                  {expense.description || cat.name}
                                </p>
                                <p className="text-xs text-rose-500">{cat.name}</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-rose-600 whitespace-nowrap">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {/* Total */}
                    <div className="p-2 bg-rose-100 rounded-lg flex justify-between items-center">
                      <span className="text-sm font-medium text-rose-700">Total</span>
                      <span className="font-bold text-rose-700">
                        {formatCurrency(selectedExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-blue-100 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/todo')}>
                <Icon name="tasks" className="w-4 h-4" />
                Tasks
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/expenses')}>
                <Icon name="wallet" className="w-4 h-4" />
                Expenses
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
