import React from 'react';

export const metadata = {
  title: 'Portal de Clientes - Mudras',
  description: 'Acceso para clientes de Mudras',
};

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <div className="min-h-screen flex flex-col">
          <header className="w-full border-b bg-white/70 backdrop-blur">
            <div className="mx-auto max-w-5xl px-4 py-4">
              <h1 className="text-lg font-semibold">Mudras · Portal de Clientes</h1>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-4 py-8">
              {children}
            </div>
          </main>
          <footer className="w-full border-t bg-white/70">
            <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-slate-500">
              © {new Date().getFullYear()} Mudras
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
