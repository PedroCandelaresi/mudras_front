'use client';

import React from 'react';

export default function ClientePanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Panel del Cliente</h2>
      <p className="text-slate-600">Bienvenido/a. Próximamente podrás ver tus pedidos y editar tu perfil.</p>
      <div className="rounded-md border bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-700">Este es un placeholder del panel del cliente.</p>
      </div>
    </div>
  );
}
