import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function ClientList() {
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data, loading } = useFetch(
    `/clients?search=${encodeURIComponent(searchTerm)}&limit=50`,
    [searchTerm]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(search);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-primary">Clientes</h1>
        <span className="text-sm text-text-light">{data?.total || 0} total</span>
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
