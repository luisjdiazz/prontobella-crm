import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: '📊' },
  { path: '/dashboard/seguimiento', label: 'Seguimiento', icon: '💬' },
  { path: '/dashboard/clientes', label: 'Clientes', icon: '👥' },
  { path: '/dashboard/procedimientos', label: 'Procedimientos', icon: '💇' },
  { path: '/dashboard/automatizaciones', label: 'Automatizaciones', icon: '🤖' },
  { path: '/dashboard/ajustes', label: 'Ajustes', icon: '⚙️' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-gray-100 transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <img src="/logo.svg" alt="PB" className="w-10 h-10" />
          <div>
            <h1 className="font-heading font-bold text-primary text-lg leading-tight">ProntoBella</h1>
            <p className="text-xs text-text-light">Salon & Nails Bar</p>
          </div>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${isActive ? 'bg-primary-soft text-primary' : 'text-text-light hover:bg-gray-50'}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-light">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-danger hover:underline"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-surface border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-primary"
          >
            ☰
          </button>
          <span className="font-heading font-semibold text-primary">ProntoBella</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
