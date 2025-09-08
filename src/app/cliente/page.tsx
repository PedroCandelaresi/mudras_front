'use client';

import React from 'react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ClienteLanding() {
  return (
    <div className="mx-auto max-w-xl text-center space-y-6">
      <h2 className="text-2xl font-semibold">Accede a tu cuenta de cliente</h2>
      <p className="text-slate-600">Continúa con tu proveedor favorito</p>
      <div className="flex flex-col gap-3">
        <a
          href={`${backendUrl}/auth/google`}
          className="w-full inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <span className="mr-2">🔐</span> Continuar con Google
        </a>
        <a
          href={`${backendUrl}/auth/instagram`}
          className="w-full inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <span className="mr-2">📷</span> Continuar con Instagram
        </a>
      </div>
    </div>
  );
}
