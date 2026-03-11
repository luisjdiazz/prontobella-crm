import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../api/client';
import StatCard from '../../components/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const PROCEDURE_LABELS = {
  color_highlights: 'Color/Highlights',
  keratina: 'Keratina',
  acrilico: 'Acrílico/Uñas',
  pestanas: 'Pestañas',
};

function getFollowUpCategory(client) {
  if (!client.last_visit) return { label: 'Nueva sin visita', color: 'gray', priority: 0 };
  const days = client.days_since_visit || 0;
  if (days >= 60) return { label: '60+ días', color: 'danger', priority: 1 };
  if (days >= 30) return { label: '30+ días', color: 'warning', priority: 2 };
  if (days >= 15) return { label: '15+ días', color: 'secondary', priority: 3 };
  return { label: 'Activa', color: 'success', priority: 4 };
}

function getSuggestedTemplate(client, templates) {
  if (!client.last_visit) return 'post_visit';
  const days = client.days_since_visit || 0;

  // Birthday today
  if (client.birthday) {
    const today = new Date();
    const [dd, mm] = client.birthday.split('/');
    if (parseInt(dd) === today.getDate() && parseInt(mm) === today.getMonth() + 1) {
      return 'birthday';
    }
  }

  // Retouch pending
  if (client.next_retouch) {
    const retouchDate = new Date(client.next_retouch);
    const daysUntil = Math.ceil((retouchDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 3) return 'retouch';
  }

  if (days >= 60) return 'miss_you_60d';
  if (days >= 30) return 'miss_you_30d';
  if (days >= 15) return 'followup_15d';
  if (days <= 1) return 'post_visit';

  return 'custom';
}

function renderTemplate(text, client) {
  return text
    .replace(/\{\{name\}\}/g, client.name?.split(' ')[0] || client.name || '')
    .replace(/\{\{visits\}\}/g, client.visit_count || 0)
    .replace(/\{\{procedure\}\}/g, PROCEDURE_LABELS[client.last_procedure] || 'tu servicio');
}

function formatPhone(phone) {
  // Ensure Dominican format for WhatsApp: 1849XXXXXXX or 1809XXXXXXX
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('1') && clean.length === 11) return clean;
  if (clean.length === 10 && (clean.startsWith('809') || clean.startsWith('829') || clean.startsWith('849'))) {
    return '1' + clean;
  }
  return clean;
}

function openWhatsApp(phone, message) {
  const encoded = encodeURIComponent(message);
  const waPhone = formatPhone(phone);
  window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
}

export default function Seguimiento() {
  const { data: clients, loading, refetch } = useFetch('/seguimiento/list');
  const { data: stats, loading: loadingStats } = useFetch('/seguimiento/stats');
  const [templates, setTemplates] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/seguimiento/templates').then(setTemplates).catch(() => {});
  }, []);

  if (loading || loadingStats) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  const filteredClients = (clients || []).filter((c) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      if (!c.name?.toLowerCase().includes(q) && !c.phone?.includes(q)) return false;
    }
    // Category filter
    if (filter === 'all') return true;
    const cat = getFollowUpCategory(c);
    if (filter === 'urgent') return cat.priority <= 2; // 30d+ and 60d+
    if (filter === '15d') return cat.priority === 3;
    if (filter === 'active') return cat.priority === 4;
    if (filter === 'new') return cat.priority === 0;
    return true;
  });

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    const suggested = getSuggestedTemplate(client, templates);
    setSelectedTemplate(suggested);
    if (templates[suggested]) {
      setCustomMessage(renderTemplate(templates[suggested].text, client));
    }
  };

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (templates[templateKey] && selectedClient) {
      setCustomMessage(renderTemplate(templates[templateKey].text, selectedClient));
    }
  };

  const handleSendWhatsApp = async () => {
    if (!selectedClient || !customMessage) return;
    setSending(true);
    try {
      // Log the follow-up
      await api.post('/seguimiento/log', {
        clientId: selectedClient.id,
        messageType: selectedTemplate || 'custom',
        messageText: customMessage,
      });
      // Open WhatsApp
      openWhatsApp(selectedClient.phone, customMessage);
      setSelectedClient(null);
      setCustomMessage('');
      refetch();
    } catch {
      // Still open WhatsApp even if logging fails
      openWhatsApp(selectedClient.phone, customMessage);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('es-DO', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatDays = (days) => {
    if (days === null || days === undefined) return null;
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold text-primary">Seguimiento de Clientes</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="60+ dias" value={stats?.inactive_60d || 0} color="danger" />
        <StatCard label="30+ dias" value={stats?.inactive_30d || 0} color="warning" />
        <StatCard label="15+ dias" value={stats?.needs_followup || 0} color="primary" />
        <StatCard label="Activas" value={stats?.active || 0} color="success" />
        <StatCard label="Cumple hoy" value={stats?.birthday_today || 0} color="secondary" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'urgent', label: 'Urgentes' },
            { key: '15d', label: '15+ días' },
            { key: 'active', label: 'Activas' },
            { key: 'new', label: 'Nuevas' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client List */}
      <div className="flex flex-col gap-3">
        {filteredClients.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-gray-400 py-4">No hay clientes en esta categoria</p>
          </Card>
        ) : (
          filteredClients.map((client) => {
            const cat = getFollowUpCategory(client);
            return (
              <div
                key={client.id}
                className="bg-surface rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{client.name}</p>
                    <Badge color={cat.color}>{cat.label}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">{client.phone}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{formatDays(client.days_since_visit) || 'Sin visitas'}</span>
                    <span>{client.visit_count} visitas</span>
                    {client.last_procedure && (
                      <span className="text-purple-500">{PROCEDURE_LABELS[client.last_procedure]}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSelectClient(client)}
                  className="shrink-0 w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Enviar WhatsApp"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* WhatsApp Message Panel */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setSelectedClient(null)}>
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-primary">Enviar Seguimiento</h3>
                <p className="text-sm text-gray-500">{selectedClient.name} — {selectedClient.phone}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Template Selector */}
            <div className="px-6 py-4 border-b border-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase">Tipo de mensaje</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(templates).map(([key, tpl]) => (
                  <button
                    key={key}
                    onClick={() => handleTemplateChange(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedTemplate === key
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview */}
            <div className="px-6 py-4">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase">Mensaje</p>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />

              {/* Client info summary */}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                <span>Ultima visita: {formatDate(selectedClient.last_visit)}</span>
                <span>Visitas: {selectedClient.visit_count}</span>
                {selectedClient.last_procedure && (
                  <span>{PROCEDURE_LABELS[selectedClient.last_procedure]}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedClient(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendWhatsApp}
                disabled={sending || !customMessage}
                className="flex-1 px-4 py-3 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
