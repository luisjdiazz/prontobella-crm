import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';

const PROCEDURE_TYPES = [
  { key: 'color_highlights', label: 'Color / Highlights', icon: '🎨', retouch: '6 semanas' },
  { key: 'keratina', label: 'Keratina / Botox', icon: '🧴', retouch: '3 meses' },
  { key: 'acrilico', label: 'Acrílico / Uñas', icon: '💎', retouch: '2-3 semanas' },
  { key: 'pestanas', label: 'Pestañas', icon: '👁️', retouch: '3 semanas' },
];

export default function CashierHome() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [client, setClient] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [todayVisits, setTodayVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);

  // Visit flow states
  const [visitLoading, setVisitLoading] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  // New client form
  const [showNewClient, setShowNewClient] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBirthday, setNewBirthday] = useState('');
  const [newClientLoading, setNewClientLoading] = useState(false);

  useEffect(() => {
    api.get('/visits/today')
      .then(setTodayVisits)
      .catch(() => {})
      .finally(() => setLoadingVisits(false));
  }, []);

  const searchClient = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setClient(null);
    setSearchResults([]);
    try {
      const isPhone = /^\d/.test(searchQuery.trim());
      if (isPhone) {
        const data = await api.get(`/clients/search?phone=${encodeURIComponent(searchQuery)}`);
        setClient(data);
      } else {
        const data = await api.get(`/clients/search?q=${encodeURIComponent(searchQuery)}`);
        if (data.length === 0) {
          setSearchError('No se encontraron clientes');
        } else if (data.length === 1) {
          setClient(data[0]);
        } else {
          setSearchResults(data);
        }
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const registerVisit = async () => {
    if (!client) return;
    setVisitLoading(true);
    try {
      const visit = await api.post('/visits', { client_id: client.id, created_by: 'cashier' });
      setCurrentVisit(visit);
      setShowProcedureModal(true);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setVisitLoading(false);
    }
  };

  const registerProcedure = async (procedureType) => {
    try {
      await api.post('/procedures', {
        client_id: client.id,
        visit_id: currentVisit?.id,
        procedure_type: procedureType,
      });
      setToast({ message: 'Procedimiento registrado', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
    finishVisit();
  };

  const finishVisit = () => {
    setShowProcedureModal(false);
    setShowSuccess(true);
    // Refresh today's visits
    api.get('/visits/today').then(setTodayVisits).catch(() => {});
  };

  const nextClient = () => {
    setShowSuccess(false);
    setClient(null);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentVisit(null);
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
        source: 'cashier',
      });
      setClient(data);
      setShowNewClient(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewBirthday('');
      setToast({ message: 'Cliente registrada', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setNewClientLoading(false);
    }
  };

  // Success screen
  if (showSuccess) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="font-heading text-2xl font-bold text-primary mb-2">¡Visita Registrada!</h2>
        <p className="text-text-light mb-6">{client?.name}</p>
        <Button onClick={nextClient} size="xl" className="w-full">
          Siguiente Clienta →
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Search section */}
      <Card>
        <h2 className="font-heading text-lg font-semibold text-primary mb-3">Buscar Cliente</h2>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nombre, apellido o telefono"
            className="flex-1"
            autoComplete="off"
            onKeyDown={(e) => e.key === 'Enter' && searchClient()}
          />
          <Button onClick={searchClient} disabled={searching}>
            {searching ? '...' : 'Buscar'}
          </Button>
        </div>
        {searchError && <p className="text-danger text-sm mt-2">{searchError}</p>}

        {/* Search results list */}
        {searchResults.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-xs text-text-light">{searchResults.length} resultados</p>
            {searchResults.map((c) => (
              <button
                key={c.id}
                onClick={() => { setClient(c); setSearchResults([]); }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-soft active:scale-[0.98] transition-all text-left"
              >
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-text-light">{c.phone}</p>
                </div>
                <Badge color="primary">{c.visit_count || 0} visitas</Badge>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowNewClient(true)}
          className="mt-3 text-sm text-primary font-medium hover:underline"
        >
          + Nueva Cliente
        </button>
      </Card>

      {/* Client info + Visit button */}
      {client && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading text-xl font-bold">{client.name}</h3>
              <p className="text-sm text-text-light">{client.phone}</p>
            </div>
            <Badge color="primary">{client.visit_count || 0} visitas</Badge>
          </div>

          {client.last_visit && (
            <p className="text-sm text-text-light mb-4">
              Última visita: {new Date(client.last_visit).toLocaleDateString('es-DO')}
            </p>
          )}

          {client.vip_code && (
            <p className="text-sm text-secondary-deep mb-4">VIP: {client.vip_code}</p>
          )}

          <Button
            onClick={registerVisit}
            disabled={visitLoading}
            size="xl"
            className="w-full"
          >
            {visitLoading ? 'Registrando...' : '✅ VISITÓ'}
          </Button>
        </Card>
      )}

      {/* Today's visits */}
      <Card>
        <h2 className="font-heading text-lg font-semibold text-primary mb-3">
          Visitas de Hoy ({todayVisits.length})
        </h2>
        {loadingVisits ? (
          <Spinner />
        ) : todayVisits.length === 0 ? (
          <p className="text-text-light text-sm">No hay visitas registradas hoy</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayVisits.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium">{v.client_name}</p>
                  <p className="text-xs text-text-light">{v.client_phone}</p>
                </div>
                <span className="text-xs text-text-light">
                  {new Date(v.visited_at).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Special procedure modal (auto-dismisses in 5s) */}
      <Modal
        isOpen={showProcedureModal}
        onClose={finishVisit}
        title="¿Procedimiento especial?"
        autoClose={5000}
      >
        <div className="flex flex-col gap-3">
          {PROCEDURE_TYPES.map((proc) => (
            <button
              key={proc.key}
              onClick={() => registerProcedure(proc.key)}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-soft transition-colors text-left"
            >
              <span className="text-2xl">{proc.icon}</span>
              <div>
                <p className="font-medium">{proc.label}</p>
                <p className="text-xs text-text-light">Retoque: {proc.retouch}</p>
              </div>
            </button>
          ))}
          <Button variant="ghost" onClick={finishVisit} className="mt-1">
            No, solo visita regular ✓
          </Button>
        </div>
      </Modal>

      {/* New client modal */}
      <Modal
        isOpen={showNewClient}
        onClose={() => setShowNewClient(false)}
        title="Nueva Cliente"
      >
        <form onSubmit={createNewClient} className="flex flex-col gap-3">
          <Input
            label="Nombre *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre completo"
            required
          />
          <Input
            label="Teléfono *"
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="809-000-0000"
            required
          />
          <Input
            label="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@ejemplo.com"
          />
          <Input
            label="Cumpleaños"
            value={newBirthday}
            onChange={(e) => setNewBirthday(e.target.value)}
            placeholder="DD/MM"
            maxLength={5}
          />
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setShowNewClient(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={newClientLoading} className="flex-1">
              {newClientLoading ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
