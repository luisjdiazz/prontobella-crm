import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import StatCard from '../../components/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const PROCEDURE_LABELS = {
  color_highlights: 'Color / Highlights',
  keratina: 'Keratina / Botox',
  acrilico: 'Acrilico / Unas',
  pestanas: 'Pestanas',
};

const SOURCE_LABELS = {
  qr: 'QR',
  cashier: 'Cajera',
  google: 'Google',
  manual: 'Manual',
};

const SOURCE_COLORS = {
  qr: 'secondary',
  cashier: 'primary',
  google: 'warning',
  manual: 'gray',
};

function formatDate(date) {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-DO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { data: stats, loading: loadingStats } = useFetch('/dashboard/stats');
  const { data: pipeline, loading: loadingPipeline } = useFetch('/dashboard/pipeline');
  const { data: retouches, loading: loadingRetouches } = useFetch('/dashboard/retoques');
  const { data: services, loading: loadingServices } = useFetch('/dashboard/servicios');

  // Date-based visits
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateVisits, setDateVisits] = useState([]);
  const [loadingDateVisits, setLoadingDateVisits] = useState(true);

  useEffect(() => {
    setLoadingDateVisits(true);
    api.get(`/visits/by-date?date=${selectedDate}`)
      .then(setDateVisits)
      .catch(() => setDateVisits([]))
      .finally(() => setLoadingDateVisits(false));
  }, [selectedDate]);

  const goDate = (offset) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Count sources for selected date
  const sourceCounts = dateVisits.reduce((acc, v) => {
    const src = v.client_source || v.created_by || 'manual';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  // Count procedures for selected date
  const procCounts = dateVisits.reduce((acc, v) => {
    if (v.procedures) {
      v.procedures.forEach((p) => {
        acc[p.procedure_type] = (acc[p.procedure_type] || 0) + 1;
      });
    }
    return acc;
  }, {});

  if (loadingStats) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-primary">Panel de Control</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total clientes" value={stats?.total_clients || 0} color="primary" />
        <StatCard label="Nuevas este mes" value={stats?.new_this_month || 0} color="secondary" />
        <StatCard label="Visitas hoy" value={stats?.visits_today || 0} color="success" />
        <StatCard label="Tasa retorno" value={`${stats?.return_rate || 0}%`} color="warning" />
        <StatCard label="Visitas este mes" value={stats?.visits_this_month || 0} color="primary" />
        <StatCard label="Inactivas (30d+)" value={stats?.no_shows || 0} color="danger" />
      </div>

      {/* Date picker + visits */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => goDate(-1)}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform text-lg"
          >
            &lt;
          </button>
          <div className="text-center flex-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="bg-transparent text-center font-heading font-semibold text-primary text-lg border-none outline-none cursor-pointer"
            />
            <p className="text-xs text-text-light capitalize">{formatDate(selectedDate)}</p>
          </div>
          <button
            onClick={() => goDate(1)}
            disabled={selectedDate >= today}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform text-lg disabled:opacity-30"
          >
            &gt;
          </button>
        </div>

        {/* Summary for selected date */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-medium">
            {dateVisits.length} visitas
          </div>
          {Object.entries(sourceCounts).map(([src, count]) => (
            <div key={src} className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-text-light">
              {SOURCE_LABELS[src] || src}: {count}
            </div>
          ))}
          {Object.entries(procCounts).map(([proc, count]) => (
            <div key={proc} className="px-3 py-1.5 rounded-full bg-secondary-soft text-secondary-deep text-xs font-medium">
              {PROCEDURE_LABELS[proc] || proc}: {count}
            </div>
          ))}
        </div>

        {/* Visit list */}
        {loadingDateVisits ? (
          <Spinner />
        ) : dateVisits.length === 0 ? (
          <p className="text-text-light text-sm py-4 text-center">Sin visitas en esta fecha</p>
        ) : (
          <div className="flex flex-col gap-2">
            {dateVisits.map((v) => (
              <div
                key={v.id}
                onClick={() => navigate(`/dashboard/clientes/${v.client_id}`)}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 active:bg-primary-soft transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{v.client_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-light">{v.client_phone}</span>
                    {v.procedures && v.procedures.map((p, i) => (
                      <span key={i} className="text-xs text-secondary-deep">
                        {PROCEDURE_LABELS[p.procedure_type] || p.procedure_type}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge color={SOURCE_COLORS[v.client_source] || 'gray'}>
                    {SOURCE_LABELS[v.client_source] || v.client_source || 'Directo'}
                  </Badge>
                  <Badge color={v.created_by === 'qr' ? 'secondary' : 'primary'}>
                    {v.created_by === 'qr' ? 'QR' : 'Cajera'}
                  </Badge>
                  <span className="text-xs text-text-light">
                    {new Date(v.visited_at).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pipeline */}
      {!loadingPipeline && pipeline && (
        <Card>
          <h2 className="font-heading text-lg font-semibold text-primary mb-4">Pipeline de clientes</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Nuevo lead', value: pipeline.new_lead, color: 'bg-blue-100 text-blue-700' },
              { label: 'Primera visita', value: pipeline.first_visit, color: 'bg-secondary-soft text-secondary-deep' },
              { label: 'Regular', value: pipeline.regular, color: 'bg-green-100 text-green-700' },
              { label: 'Inactiva', value: pipeline.inactive, color: 'bg-red-100 text-red-700' },
            ].map((stage) => (
              <div key={stage.label} className={`rounded-xl p-4 text-center ${stage.color}`}>
                <p className="text-2xl font-bold">{stage.value || 0}</p>
                <p className="text-sm mt-1">{stage.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming retouches */}
        <Card>
          <h2 className="font-heading text-lg font-semibold text-primary mb-4">Retoques proximos</h2>
          {loadingRetouches ? (
            <Spinner />
          ) : !retouches?.length ? (
            <p className="text-text-light text-sm">No hay retoques proximos</p>
          ) : (
            <div className="flex flex-col gap-3">
              {retouches.slice(0, 8).map((r) => {
                const daysUntil = Math.ceil((new Date(r.next_retouch) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{r.client_name}</p>
                      <p className="text-xs text-text-light">{PROCEDURE_LABELS[r.procedure_type]}</p>
                    </div>
                    <Badge color={daysUntil <= 1 ? 'danger' : daysUntil <= 3 ? 'warning' : 'gray'}>
                      {daysUntil <= 0 ? 'Hoy' : `${daysUntil}d`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Popular services */}
        <Card>
          <h2 className="font-heading text-lg font-semibold text-primary mb-4">Servicios populares</h2>
          {loadingServices ? (
            <Spinner />
          ) : !services?.length ? (
            <p className="text-text-light text-sm">No hay datos de servicios aun</p>
          ) : (
            <div className="flex flex-col gap-3">
              {services.map((s) => (
                <div key={s.procedure_type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{PROCEDURE_LABELS[s.procedure_type] || s.procedure_type}</span>
                  <span className="font-bold text-primary">{s.total}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
