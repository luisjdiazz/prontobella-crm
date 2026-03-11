import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function CashierLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="PB" className="w-8 h-8" />
          <span className="font-heading font-semibold text-lg">ProntoBella</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-lg mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
