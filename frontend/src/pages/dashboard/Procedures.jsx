import { useFetch } from '../../hooks/useFetch';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const PROCEDURE_LABELS = {
  color_highlights: { label: 'Color / Highlights', icon: '🎨' },
  keratina: { label: 'Keratina / Botox', icon: '🧴' },
  acrilico: { label: 'Acrílico / Uñas', icon: '💎' },
  pestanas: { label: 'Pestañas', icon: '👁️' },
};

export default function Procedures() {
  const { data: upcoming, loading } = useFetch('/procedures/upcoming?days=14');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold text-primary">Procedimientos</h1>

      <Card>
        <h2 className="font-heading text-lg font-semibold text-primary mb-4">
          Retoques Próximos (14 días)
        </h2>
        {loading ? (
          <Spinner />
        ) : !upcoming?.length ? (
          <p className="text-text-light text-sm">No hay retoques próximos</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((r) => {
              const proc = PROCEDURE_LABELS[r.procedure_type] || {};
              const daysUntil = Math.ceil((new Date(r.next_retouch) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{proc.icon}</span>
                    <div>
                      <p className="font-medium">{r.client_name}</p>
                      <p className="text-sm text-text-light">{r.client_phone}</p>
                      <p className="text-xs text-text-light">{proc.label || r.procedure_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge color={daysUntil <= 1 ? 'danger' : daysUntil <= 3 ? 'warning' : 'gray'}>
                      {daysUntil <= 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil} días`}
                    </Badge>
                    <p className="text-xs text-text-light mt-1">
                      {new Date(r.next_retouch).toLocaleDateString('es-DO')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
