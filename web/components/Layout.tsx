
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { to: '/', label: 'Dashboard', icon: 'fa-chart-pie' },
    { to: '/transactions', label: 'Transações', icon: 'fa-exchange-alt' },
    { to: '/categories', label: 'Categorias', icon: 'fa-tags' },
    { to: '/flow', label: 'Fluxo', icon: 'fa-diagram-project' },
    { to: '/goals', label: 'Objetivos', icon: 'fa-bullseye' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <i className="fa-solid fa-wallet"></i> Financy
          </h1>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                }`
              }
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Academic Project</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Full Stack & AI</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Mobile */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-30">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <i className="fa-solid fa-wallet"></i> Financy
            </h1>
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>

        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 sticky bottom-0 z-30 shadow-lg">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                }`
              }
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
