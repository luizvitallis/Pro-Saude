import React, { useState } from 'react';
import { useAdmin } from '@/lib/AdminContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminGate({ children }) {
  const { isAdmin, authenticate } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (isAdmin) {
    return children;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authenticate(password)) {
      setError('');
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-sm shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-slate-600" />
          </div>
          <CardTitle className="text-xl">Acesso Restrito</CardTitle>
          <CardDescription>Digite a senha de administrador para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
                Entrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
