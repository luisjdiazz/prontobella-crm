import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const PROCEDURE_LABELS = {
  color_highlights: { label: 'Color / Highlights', icon: '🎨' },
  keratina: { label: 'Keratina / Botox', icon: '🧴' },
  acrilico: { label: 'Acrílico / Uñas', icon: '💎' },
  pestanas: { label: 'Pestañas', icon: '👁️' },
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, loading } = useFetch(`/clients/${id}`);
  const { data: visits, loading: loadingVisits } = useFetch(`/visits?client_id=${id}`);
  const { data: procedures, loading: loadingProcs } = useFetch(`/procedures?client_id=${id}`);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.del(`/clients/${id}`);
      navigate('/dashboard/clientes');
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!client) {
    return <p className="text-center text-text-light py-12">Cliente no encontrado</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline self-start">
        ← Volver
      </button>

      {/* Client info */}
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary">{client.name}</h1>
            <p className="text-text-light">{client.phone}</p>
            {client.email && <p className="text-text-light text-sm">{client.email}</p>}
            {client.birthday && <p className="text-text-light text-sm">Cumple: {client.birthday}</p>}
          </div>
          <div className="text-right">
            <Badge color="primary" className="text-base">{client.visit_count || 0} visitas</Badge>
            {client.vip_code && (
              <p className="text-sm text-secondary-deep mt-2">VIP: {client.vip_code}</p>
            )}
          </div>
        </div>
        {client.last_visit && (
          <p className="text-sm text-text-light mt-3">
            Última visita: {new Date(client.last_visit).toLocaleDateString('es-DO')}
          </p>
        )}
        <p className="text-xs text-text-light mt-1">
          Registrada: {new Date(client.created_at).toLocaleDateString('es-DO')} via {client.source}
        </p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Visits */}
        <Card>
          <h2 className="font-heading text-lg font-semibold text-primary mb-3">Historial de Visitas</h2>
          {loadingVisits ? (
            <Spinner />
          ) : !visits?.length ? (
            <p className="text-text-light text-sm">Sin visitas registradas</p>
          ) : (
            <div className="flex flex-col gap-2">
              {visits.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(v.visited_at).toLocaleDateString('es-DO')}
                    </p>
                    {v.notes && <p className="text-xs text-text-light">{v.notes}</p>}
                  </div>
                  <span className="text-xs text-text-light">
                    {new Date(v.visited_at).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Procedures */}
        <Card>
          <h2 className="font-heading text-lg font-semibold text-primary mb-3">Procedimientos Especiales</h2>
          {loadingProcs ? (
            <Spinner />
          ) : !procedures?.length ? (
            <p className="text-text-light text-sm">Sin procedimientos registrados</p>
          ) : (
            <div className="flex flex-col gap-3">
              {procedures.map((p) => {
                const proc = PROCEDURE_LABELS[p.procedure_type] || {};
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{proc.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{proc.label || p.procedure_type}</p>
                        <p className="text-xs text-text-light">
                          {new Date(p.performed_at).toLocaleDateString('es-DO')}
                        </p>
                      </div>
                    </div>
                    {p.next_retouch && (
                      <div className="text-right">
                        <p className="text-xs text-text-light">Retoque:</p>
                        <p className="text-sm font-medium">
                          {new Date(p.next_retouch).toLocaleDateString('es-DO')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Delete */}
      <Card className="!border-red-100">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-danger hover:underline"
          >
            Eliminar cliente
          </button>
        ) : (
          <div>
            <p className="text-sm text-text mb-3">Segura que quieres eliminar a {client.name}? Se borraran todas sus visitas y datos.</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting} className="flex-1">
                {deleting ? 'Eliminando...' : 'Si, eliminar'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
