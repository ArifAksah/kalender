import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icons';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/todo', label: 'Tasks', icon: 'tasks' },
  { path: '/expenses', label: 'Finance', icon: 'wallet' },
  { path: '/analytics', label: 'Analytics', icon: 'analytics' },
  { path: '/achievements', label: 'Achievements', icon: 'trophy' },
  { path: '/games', label: 'Games', icon: 'gamepad' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = navItems.find(i => i.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-blue-900/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-sm border-r border-blue-100 shadow-sm transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">P</div>
            <span className="text-lg font-semibold text-blue-900">Progress</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-blue-400 hover:text-blue-600">
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="pt-4 border-t border-blue-100 space-y-2">
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-medium text-white shadow-sm">
                {user?.name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <span className="text-sm truncate">{user?.name || user?.username || 'User'}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-600 hover:bg-red-50 hover:text-red-500 text-sm transition-colors"
            >
              <Icon name="logout" className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 px-6 flex items-center justify-between bg-white/60 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-blue-500 hover:text-blue-700">
              <Icon name="menu" className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-blue-900">{currentPage}</h1>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
