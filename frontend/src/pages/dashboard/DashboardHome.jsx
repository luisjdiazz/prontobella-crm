import { useFetch } from '../../hooks/useFetch';
import StatCard from '../../components/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const PROCEDURE_LABELS = {
  color_highlights: { label: 'Color / Highlights', icon: '🎨' },
  keratina: { label: 'Keratina / Botox', icon: '🧴' },
  acrilico: { label: 'Acrílico / Uñas', icon: '💎' },
  pestanas: { label: 'Pestañas', icon: '👁️' },
};

export default function DashboardHome() {
  const { data: stats, loading: loadingStats } = useFetch('/dashboard/stats');
  const { data: pipeline, loading: loadingPipeline } = useFetch('/dashboard/pipeline');
  const { data: retouches, loading: loadingRetouches } = useFetch('/dashboard/retoques');
  const { data: services, loading: loadingServices } = useFetch('/dashboard/servicios');

  if (loadingStats) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-primary">Panel de Control</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Clientes" value={stats?.total_clients || 0} color="primary" />
        <StatCard icon="🆕" label="Nuevas este Mes" value={stats?.new_this_month || 0} color="secondary" />
        <StatCard icon="📅" label="Visitas Hoy" value={stats?.visits_today || 0} color="success" />
        <StatCard icon="🔄" label="Tasa Retorno" value={`${stats?.return_rate || 0}%`} color="warning" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📆" label="Visitas este Mes" value={stats?.visits_this_month || 0} color="primary" />
        <StatCard icon="😢" label="Inactivas (30d+)" value={stats?.no_shows || 0} color="danger" />
      </div>

      {/* Pipeline */}
      {!loadingPipeline && pipeline && (
        <Card>
          <h2 className="font-heading text-lg font-semibold text-primary mb-4">Pipeline de Clientes</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Nuevo Lead', value: pipeline.new_lead, color: 'bg-blue-100 text-blue-700' },
              { label: 'Primera Visita', value: pipeline.first_visit, color: 'bg-secondary-soft text-secondary-deep' },
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
          <h2 className="font-heading text-lg font-semibold text-primary mb-4">Retoques Próximos</h2>
          {loadingRetouches ? (
            <Spinner />
          ) : !retouches?.length ? (
            <p className="text-text-light text-sm">No hay retoques próximos</p>
          ) : (
            <div className="flex flex-col gap-3">
              {retouches.slice(0, 8).map((r) => {
                const proc = PROCEDURE_LABELS[r.procedure_type] || {};
                const daysUntil = Math.ceil((new Date(r.next_retouch) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{proc.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{r.client_name}</p>
                        <p className="text-xs text-text-light">{proc.label}</p>
                      </div>
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
          <h2 className="font-heading text-lg font-semibold text-primary mb-4">Servicios Populares</h2>
          {loadingServices ? (
            <Spinner />
          ) : !services?.length ? (
            <p className="text-text-light text-sm">No hay datos de servicios aún</p>
          ) : (
            <div className="flex flex-col gap-3">
              {services.map((s) => {
                const proc = PROCEDURE_LABELS[s.procedure_type] || {};
                return (
                  <div key={s.procedure_type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{proc.icon}</span>
                      <span className="text-sm font-medium">{proc.label || s.procedure_type}</span>
                    </div>
                    <span className="font-bold text-primary">{s.total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
