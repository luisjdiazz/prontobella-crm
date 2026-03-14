import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';

export default function ClientList() {
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // New client form
  const [showNewClient, setShowNewClient] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newClientLoading, setNewClientLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, loading } = useFetch(
    `/clients?search=${encodeURIComponent(searchTerm)}&limit=50`,
    [searchTerm]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(search);
  };

  const downloadExport = async (params = '') => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${base}/export/clients${params ? `?${params}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'clientes.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
      setToast({ message: 'Archivo descargado', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const downloadBackup = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${base}/export/backup`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'backup.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
      setToast({ message: 'Backup descargado', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const createNewClient = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    setNewClientLoading(true);
    try {
      const data = await api.post('/clients', {
        name: newName,
        phone: newPhone,
        email: newEmail || undefined,
        birthday: newBirthday || undefined,
        source: 'manual',
      });
      setShowNewClient(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewBirthday('');
      setToast({ message: 'Cliente registrada', type: 'success' });
      navigate(`/dashboard/clientes/${data.id}`);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setNewClientLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-primary">Clientes</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-light">{data?.total || 0} total</span>
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-deep transition text-sm"
          >
            Exportar
          </button>
          <button
            onClick={() => setShowNewClient(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-deep transition text-sm"
          >
            + Nueva Cliente
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="flex-1"
        />
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-deep transition">
          Buscar
        </button>
      </form>

      {/* New Client Modal */}
      <Modal isOpen={showNewClient} onClose={() => setShowNewClient(false)} title="Nueva Cliente">
        <form onSubmit={createNewClient} className="flex flex-col gap-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre completo *"
            required
          />
          <Input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Teléfono * (809-000-0000)"
            required
          />
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email (opcional)"
          />
          <Input
            value={newBirthday}
            onChange={(e) => setNewBirthday(e.target.value)}
            placeholder="Cumpleaños (DD/MM, opcional)"
            maxLength={5}
          />
          <button
            type="submit"
            disabled={newClientLoading || !newName.trim() || !newPhone.trim()}
            className="mt-2 w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-deep transition disabled:opacity-50"
          >
            {newClientLoading ? 'Registrando...' : 'Registrar Cliente'}
          </button>
        </form>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={showExport} onClose={() => setShowExport(false)} title="Exportar Clientes">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-text-light mb-1">Exportar por periodo de registro:</p>
          <button
            onClick={() => downloadExport('period=today')}
            disabled={exporting}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-deep transition disabled:opacity-50"
          >
            Hoy
          </button>
          <button
            onClick={() => downloadExport('period=week')}
            disabled={exporting}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-deep transition disabled:opacity-50"
          >
            Esta semana
          </button>
          <button
            onClick={() => downloadExport('period=month')}
            disabled={exporting}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-deep transition disabled:opacity-50"
          >
            Este mes
          </button>
          <button
            onClick={() => downloadExport()}
            disabled={exporting}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-deep transition disabled:opacity-50"
          >
            Todos los clientes
          </button>

          <p className="text-sm text-text-light mt-2 mb-1">Exportar por frecuencia de visitas:</p>
          <button
            onClick={() => downloadExport('minVisits=5')}
            disabled={exporting}
            className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-deep transition disabled:opacity-50"
          >
            Frecuentes (5+ visitas)
          </button>
          <button
            onClick={() => downloadExport('minVisits=2&maxVisits=4')}
            disabled={exporting}
            className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-deep transition disabled:opacity-50"
          >
            Regulares (2-4 visitas)
          </button>
          <button
            onClick={() => downloadExport('maxVisits=1')}
            disabled={exporting}
            className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-deep transition disabled:opacity-50"
          >
            Nuevas (0-1 visitas)
          </button>

          <div className="border-t border-gray-100 pt-3 mt-1">
            <button
              onClick={downloadBackup}
              disabled={exporting}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition disabled:opacity-50"
            >
              Backup completo (clientes + visitas + procedimientos)
            </button>
          </div>

          {exporting && <p className="text-xs text-text-light text-center">Generando archivo...</p>}
        </div>
      </Modal>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="p-6"><Spinner /></div>
        ) : !data?.clients?.length ? (
          <p className="p-6 text-text-light text-sm">No se encontraron clientes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-light">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-text-light">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-text-light hidden md:table-cell">Visitas</th>
                  <th className="text-left px-4 py-3 font-medium text-text-light hidden md:table-cell">VIP</th>
                  <th className="text-left px-4 py-3 font-medium text-text-light hidden lg:table-cell">Registro</th>
                </tr>
              </thead>
              <tbody>
                {data.clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/dashboard/clientes/${client.id}`)}
                    className="border-t border-gray-50 hover:bg-primary-soft/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{client.name}</td>
                    <td className="px-4 py-3 text-text-light">{client.phone}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge>{client.visit_count || 0}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-secondary-deep">{client.vip_code || '-'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-text-light">
                      {new Date(client.created_at).toLocaleDateString('es-DO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
