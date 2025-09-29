// /src/components/container/PageContainer.tsx
import React from 'react';
import { WoodPanel } from '@/components/ui/TexturedFrame/WoodPanel';

type Props = {
  description?: string;
  children: React.ReactNode;
  title?: string;
  // Opcional: activar fondo madera desde el contenedor
  woodAccent?: string;
  useWood?: boolean;
};

const PageContainer = ({ title, description, children, useWood, woodAccent }: Props) => (
  <div>
    <title>{title}</title>
    <meta name="description" content={description} />
    {useWood ? (
      <WoodPanel accent={woodAccent ?? '#e91e63'} p={18} radius={16}>
        {children}
      </WoodPanel>
    ) : (
      children
    )}
  </div>
);

export default PageContainer;
