import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';

const TYPE_LABELS = {
  welcome: { label: 'Bienvenida', color: 'secondary' },
  miss_you_30d: { label: 'Te extrañamos (30d)', color: 'warning' },
  miss_you_60d: { label: 'Win-back (60d)', color: 'danger' },
  retouch: { label: 'Retoque', color: 'primary' },
  birthday: { label: 'Cumpleaños', color: 'success' },
  loyalty_5th: { label: 'Lealtad 5ta visita', color: 'secondary' },
};

const STATUS_COLORS = {
  pending: 'warning',
  sent: 'success',
  delivered: 'success',
  read: 'primary',
  failed: 'danger',
};

export default function Automations() {
  const [filter, setFilter] = useState('');
  const { data: automations, loading, refetch } = useFetch(
    `/automations${filter ? `?status=${filter}` : ''}`,
    [filter]
  );
  const [runningEngine, setRunningEngine] = useState(false);
  const [toast, setToast] = useState(null);

  const runEngine = async () => {
    setRunningEngine(true);
    try {
      const result = await api.post('/automations/run');
      setToast({ message: `Evaluación completada`, type: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setRunningEngine(false);
    }
  };

  const markAsSent = async (id) => {
    try {
      await api.post(`/automations/${id}/mark-sent`);
      refetch();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-primary">Automatizaciones</h1>
        <Button onClick={runEngine} disabled={runningEngine} size="sm">
          {runningEngine ? 'Evaluando...' : 'Evaluar Ahora'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'sent', 'failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'}`}
          >
            {f === '' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'sent' ? 'Enviados' : 'Fallidos'}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6"><Spinner /></div>
        ) : !automations?.length ? (
          <p className="p-6 text-text-light text-sm">No hay automatizaciones</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-light">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-text-light">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-text-light hidden md:table-cell">Mensaje</th>
                  <th className="text-left px-4 py-3 font-medium text-text-light">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {automations.map((a) => {
                  const typeInfo = TYPE_LABELS[a.type] || { label: a.type, color: 'gray' };
                  return (
                    <tr key={a.id} className="border-t border-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{a.client_name}</p>
                        <p className="text-xs text-text-light">{a.client_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={typeInfo.color}>{typeInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-text-light truncate max-w-xs">{a.message_text}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={STATUS_COLORS[a.status] || 'gray'}>{a.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {a.status === 'pending' && (
                          <button
                            onClick={() => markAsSent(a.id)}
                            className="text-xs text-primary hover:underline"
                          >
                            Marcar enviado
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
