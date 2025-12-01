import React, { useState, useMemo } from 'react';
import Icon from './Icons';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function TaskCalendar({ tasks = [], expenses = [], onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      const date = task.due_date ? task.due_date.split('T')[0] : null;
      if (date) {
        if (!map[date]) map[date] = { tasks: [], expenses: [] };
        map[date].tasks.push(task);
      }
    });
    expenses.forEach(expense => {
      const date = expense.date ? expense.date.split('T')[0] : null;
      if (date) {
        if (!map[date]) map[date] = { tasks: [], expenses: [] };
        map[date].expenses.push(expense);
      }
    });
    return map;
  }, [tasks, expenses]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, date: null });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const data = tasksByDate[dateStr] || { tasks: [], expenses: [] };
      days.push({ 
        day: i, 
        isCurrentMonth: true, 
        date: dateStr, 
        tasks: data.tasks,
        expenses: data.expenses
      });
    }
    
    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays && days.length < 35; i++) {
      days.push({ day: i, isCurrentMonth: false, date: null });
    }
    
    return days;
  }, [year, month, tasksByDate]);

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;



  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
            <Icon name="calendar" className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-900">{MONTHS[month]}</h3>
            <p className="text-xs text-blue-500">{year}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-600 transition-all shadow-sm"
          >
            <Icon name="chevronLeft" className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-600 transition-all shadow-sm"
          >
            <Icon name="chevronRight" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((day, i) => (
          <div 
            key={day} 
            className={`text-center text-xs font-bold py-1 rounded ${
              i === 0 ? 'text-rose-500' : i === 6 ? 'text-indigo-500' : 'text-blue-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, index) => {
          const isToday = item.date === todayStr;
          const hasTasks = item.tasks && item.tasks.length > 0;
          const hasExpenses = item.expenses && item.expenses.length > 0;
          const hasData = hasTasks || hasExpenses;
          const taskCount = item.tasks?.length || 0;
          const completedCount = item.tasks?.filter(t => t.status === 'completed').length || 0;
          const allCompleted = taskCount > 0 && completedCount === taskCount;
          const dayOfWeek = index % 7;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          // Determine background color
          let bgClass = '';
          if (!item.isCurrentMonth) {
            bgClass = 'text-blue-200 cursor-default';
          } else if (isToday && hasData) {
            bgClass = 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-300 cursor-pointer';
          } else if (isToday) {
            bgClass = 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md';
          } else if (hasTasks && hasExpenses) {
            bgClass = 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-md cursor-pointer hover:shadow-lg hover:scale-105';
          } else if (hasTasks && allCompleted) {
            bgClass = 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md cursor-pointer hover:shadow-lg hover:scale-105';
          } else if (hasTasks) {
            bgClass = 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md cursor-pointer hover:shadow-lg hover:scale-105';
          } else if (hasExpenses) {
            bgClass = 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-md cursor-pointer hover:shadow-lg hover:scale-105';
          } else {
            bgClass = isWeekend ? 'text-blue-400 hover:bg-blue-50' : 'text-blue-700 hover:bg-blue-50';
          }
          
          return (
            <button
              key={index}
              onClick={() => hasData && onDateClick && onDateClick(item.date, item.tasks, item.expenses)}
              disabled={!item.isCurrentMonth}
              className={`relative h-9 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${bgClass}`}
            >
              {item.day}
              {/* Task indicator */}
              {hasTasks && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold shadow ${
                  isToday ? 'bg-white text-purple-600' : 
                  allCompleted ? 'bg-white text-emerald-600' : 'bg-white text-orange-600'
                }`}>
                  {taskCount}
                </span>
              )}
              {/* Expense indicator */}
              {hasExpenses && !hasTasks && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold shadow bg-white text-rose-600">
                  $
                </span>
              )}
              {/* Both indicator */}
              {hasTasks && hasExpenses && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 flex items-center justify-center rounded-full text-[8px] font-bold shadow bg-rose-500 text-white">
                  $
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-blue-100 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm" />
          <span className="text-xs text-blue-600">Task</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm" />
          <span className="text-xs text-blue-600">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-rose-400 to-pink-500 shadow-sm" />
          <span className="text-xs text-blue-600">Expense</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm" />
          <span className="text-xs text-blue-600">Today</span>
        </div>
      </div>
    </div>
  );
}

export default TaskCalendar;
