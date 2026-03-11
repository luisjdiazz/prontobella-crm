import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import CashierLayout from './layouts/CashierLayout';
import DashboardLayout from './layouts/DashboardLayout';
import CheckIn from './pages/CheckIn';
import Login from './pages/Login';
import CashierHome from './pages/cashier/CashierHome';
import DashboardHome from './pages/dashboard/DashboardHome';
import ClientList from './pages/dashboard/ClientList';
import ClientDetail from './pages/dashboard/ClientDetail';
import Procedures from './pages/dashboard/Procedures';
import Automations from './pages/dashboard/Automations';
import Settings from './pages/dashboard/Settings';
import Seguimiento from './pages/dashboard/Seguimiento';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Cashier */}
          <Route element={<ProtectedRoute roles={['cashier', 'owner']} />}>
            <Route element={<CashierLayout />}>
              <Route path="/cajera" element={<CashierHome />} />
            </Route>
          </Route>

          {/* Owner Dashboard */}
          <Route element={<ProtectedRoute roles={['owner']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/clientes" element={<ClientList />} />
              <Route path="/dashboard/clientes/:id" element={<ClientDetail />} />
              <Route path="/dashboard/procedimientos" element={<Procedures />} />
              <Route path="/dashboard/seguimiento" element={<Seguimiento />} />
              <Route path="/dashboard/automatizaciones" element={<Automations />} />
              <Route path="/dashboard/ajustes" element={<Settings />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/checkin" replace />} />
          <Route path="*" element={<Navigate to="/checkin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
