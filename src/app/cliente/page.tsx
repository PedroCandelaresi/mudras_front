'use client';

import React from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function ClienteLanding() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [mostrarPassword, setMostrarPassword] = React.useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/cliente/panel';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/login-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || 'Error de autenticación');
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-2xl font-semibold text-center">Accede a tu cuenta de cliente</h2>
      <p className="text-slate-600 text-center">Elige cómo quieres ingresar</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 border rounded-md p-4 bg-white">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <input
            type={mostrarPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            className="w-full rounded-md border border-slate-300 pr-10 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label="Mostrar contraseña"
            onClick={() => setMostrarPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {mostrarPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        </div>
        <button type="submit" className="w-full rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">
          Ingresar con Email
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <a
          href={`${backendUrl.replace(/\/$/, '')}/auth/google`}
          className="w-full inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <span className="mr-2">🔐</span> Continuar con Google
        </a>
        <a
          href={`${backendUrl.replace(/\/$/, '')}/auth/instagram`}
          className="w-full inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <span className="mr-2">📷</span> Continuar con Instagram
        </a>
      </div>
    </div>
  );
}
