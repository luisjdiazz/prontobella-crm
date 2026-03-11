import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Login() {
  const [mode, setMode] = useState('pin'); // 'pin' | 'owner'
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePinLogin = async () => {
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/auth/pin', { pin });
      login(data.token, data.user);
      navigate('/cajera');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        // Auto-submit when 4 digits entered
        setTimeout(() => {
          setLoading(true);
          api.post('/auth/pin', { pin: newPin })
            .then((data) => {
              login(data.token, data.user);
              navigate('/cajera');
            })
            .catch((err) => {
              setError(err.message);
              setPin('');
            })
            .finally(() => setLoading(false));
        }, 200);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <img src="/logo.svg" alt="ProntoBella" className="w-20 h-20 mx-auto mb-4" />
        <h1 className="font-heading text-3xl font-bold text-primary">ProntoBella</h1>
        <p className="text-text-light mt-1">Salón & Nails Bar</p>
      </div>

      <Card className="w-full max-w-sm">
        {/* Mode tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => { setMode('pin'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${mode === 'pin' ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            Cajera (PIN)
          </button>
          <button
            onClick={() => { setMode('owner'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${mode === 'owner' ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            Dueña
          </button>
        </div>

        {mode === 'pin' ? (
          <div className="text-center">
            <p className="text-sm text-text-light mb-4">Ingresa tu PIN de 4 dígitos</p>

            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-colors ${
                    i < pin.length ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (key === 'del') { setPin(pin.slice(0, -1)); setError(''); }
                    else if (key !== null) handlePinInput(String(key));
                  }}
                  disabled={key === null || loading}
                  className={`h-14 rounded-xl text-xl font-medium transition-colors
                    ${key === null ? 'invisible' : ''}
                    ${key === 'del' ? 'text-text-light text-base' : 'bg-gray-50 hover:bg-primary-soft text-text'}`}
                >
                  {key === 'del' ? '⌫' : key}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleOwnerLogin} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@prontobella.com"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        )}

        {error && (
          <p className="text-danger text-sm text-center mt-4">{error}</p>
        )}
      </Card>
    </div>
  );
}
