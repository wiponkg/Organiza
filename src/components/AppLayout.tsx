import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { 
  Layout, CheckSquare, BarChart3, LogOut, 
  Sun, Moon, Menu, X, User
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors duration-300 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Layout size={24} />
            </div>
            <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Organiza+</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium
                    ${isActive 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}
                  `}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button 
                onClick={toggle}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-sm font-medium"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-zinc-500 dark:text-zinc-400 lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Status: <span className="text-emerald-500">Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
