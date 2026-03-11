import { useState } from 'react';
import { api } from '../api/client';

export default function CheckIn() {
  const [step, setStep] = useState('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nombre y WhatsApp son requeridos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/checkin', { name, phone, email });
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
    setResult(null);
    setError('');
  };

  if (step === 'success') {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-primary to-primary-deep flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-bold text-primary mb-2">
            {result?.client?.is_new ? 'Bienvenida!' : 'Hola de nuevo!'}
          </h2>
          <p className="text-text-light text-sm mb-5">{result?.message}</p>

          {result?.client?.vip_code && result?.client?.is_new && (
            <div className="bg-primary-soft rounded-2xl p-5 mb-5">
              <p className="text-xs text-text-light mb-1">Tu codigo VIP</p>
              <p className="text-3xl font-bold text-primary font-heading tracking-wider">
                {result.client.vip_code}
              </p>
              <p className="text-xs text-text-light mt-2">10% de descuento en tu proxima visita</p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full py-4 rounded-2xl border-2 border-primary text-primary font-medium text-base active:scale-[0.98] transition-transform"
          >
            Nuevo registro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-primary to-primary-deep flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <img src="/logo.svg" alt="ProntoBella" className="w-20 h-20 mx-auto mb-3" />
        <h1 className="font-heading text-3xl font-bold text-white">ProntoBella</h1>
        <p className="text-white/70 text-sm mt-1">Salon & Nails Bar</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        <h2 className="font-heading text-xl font-semibold text-primary text-center mb-1">
          Bienvenida!
        </h2>
        <p className="text-text-light text-sm text-center mb-6">
          Registrate para recibir beneficios exclusivos
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-text mb-1.5 block">Nombre y apellido</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Maria Garcia"
              required
              autoComplete="name"
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 text-base
                bg-white text-text placeholder:text-gray-300
                focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text mb-1.5 block">WhatsApp</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="809-000-0000"
              required
              autoComplete="tel"
              inputMode="tel"
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 text-base
                bg-white text-text placeholder:text-gray-300
                focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-light mb-1.5 block">Email (opcional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              inputMode="email"
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 text-base
                bg-white text-text placeholder:text-gray-300
                focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-white font-semibold text-lg
              active:scale-[0.98] transition-transform
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>
      </div>
    </div>
  );
}
