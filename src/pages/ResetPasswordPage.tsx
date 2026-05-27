import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore'; 
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  // Extragem funcția din store-ul Zustand corect
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token-ul de resetare lipsește sau este invalid.');
      return;
    }

    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parolele introduse nu se potrivesc.');
      return;
    }

    setLoading(true);
    try {
      const success = await resetPassword(token, password);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare. Token-ul ar putea fi expirat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Resetare Parolă
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Introdu mai jos noua ta parolă pentru a îți recupera contul.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md text-sm text-center">
            Parola a fost modificată cu succes! Te redirecționăm la Login...
          </div>
        )}

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Am pasat `label` direct catre componenta Input */}
              <Input
                label="Noua Parolă"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              
              <Input
                label="Confirmă Parola"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Se salvează...' : 'Resetează Parola'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}