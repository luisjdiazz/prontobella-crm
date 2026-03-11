import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';

export default function Settings() {
  const { data: users, loading, refetch } = useFetch('/dashboard/stats'); // placeholder, we need a users endpoint
  const [toast, setToast] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold text-primary">Ajustes</h1>

      <Card>
        <h2 className="font-heading text-lg font-semibold text-primary mb-4">Información del Salón</h2>
        <div className="grid gap-3">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-text-light">Nombre</span>
            <span className="font-medium">ProntoBella — Salón & Nails Bar</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-text-light">Teléfono</span>
            <span className="font-medium">809-682-0069</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-text-light">Ubicación</span>
            <span className="font-medium">Santo Domingo, RD</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-heading text-lg font-semibold text-primary mb-4">Credenciales de Acceso</h2>
        <div className="grid gap-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <div>
              <p className="font-medium">Administrador</p>
              <p className="text-xs text-text-light">admin@prontobella.com</p>
            </div>
            <Badge color="primary">Owner</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <div>
              <p className="font-medium">Cajera Principal</p>
              <p className="text-xs text-text-light">PIN: 1234</p>
            </div>
            <Badge color="secondary">Cashier</Badge>
          </div>
        </div>
        <p className="text-xs text-text-light mt-4">
          Para cambiar PINs o contraseñas, contacta al administrador del sistema.
        </p>
      </Card>

      <Card>
        <h2 className="font-heading text-lg font-semibold text-primary mb-4">WhatsApp Business (Fase 2)</h2>
        <p className="text-text-light text-sm">
          La integración con WhatsApp Business API está planificada para la Fase 2.
          Las automatizaciones actualmente se registran como pendientes y pueden ser
          marcadas manualmente como enviadas desde la sección de Automatizaciones.
        </p>
        <Badge color="warning" className="mt-3">Próximamente</Badge>
      </Card>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
