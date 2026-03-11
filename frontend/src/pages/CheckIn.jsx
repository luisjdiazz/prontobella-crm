import { useState } from 'react';
import { api } from '../api/client';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function CheckIn() {
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nombre y teléfono son requeridos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/checkin', { name, phone, email, birthday });
      setResult(data);
      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setName('');
    setPhone('');
    setEmail('');
    setBirthday('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-deep flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <img src="/logo.svg" alt="ProntoBella" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="font-heading text-3xl font-bold text-white">ProntoBella</h1>
        <p className="text-white/80 mt-1">Salón & Nails Bar</p>
      </div>

      {step === 'form' ? (
        <Card className="w-full max-w-sm">
          <h2 className="font-heading text-xl font-semibold text-primary text-center mb-2">
            ¡Bienvenida!
          </h2>
          <p className="text-text-light text-sm text-center mb-6">
            Regístrate para recibir beneficios exclusivos
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nombre completo *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
            <Input
              label="Teléfono *"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="809-000-0000"
              required
            />
            <Input
              label="Email (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
            <Input
              label="Cumpleaños (opcional)"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              placeholder="DD/MM"
              maxLength={5}
            />

            {error && <p className="text-danger text-sm text-center">{error}</p>}

            <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
              {loading ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">💜</div>
          <h2 className="font-heading text-2xl font-bold text-primary mb-2">
            {result?.client?.is_new ? '¡Bienvenida!' : '¡Hola de nuevo!'}
          </h2>
          <p className="text-text mb-4">{result?.message}</p>

          {result?.client?.vip_code && result?.client?.is_new && (
            <div className="bg-primary-soft rounded-xl p-4 mb-4">
              <p className="text-sm text-text-light mb-1">Tu código VIP:</p>
              <p className="text-2xl font-bold text-primary font-heading">
                {result.client.vip_code}
              </p>
              <p className="text-xs text-text-light mt-1">10% de descuento en tu próxima visita</p>
            </div>
          )}

          <Button onClick={handleReset} variant="outline" className="w-full mt-4">
            Nueva Registro
          </Button>
        </Card>
      )}
    </div>
  );
}
