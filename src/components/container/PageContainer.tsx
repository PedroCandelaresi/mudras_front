// /src/components/container/PageContainer.tsx
import React from 'react';

type Props = {
  description?: string;
  children: React.ReactNode;
  title?: string;
  // deprecated props kept for compatibility but ignored
  woodAccent?: string;
  useWood?: boolean;
};

const PageContainer = ({ title, description, children }: Props) => (
  <div>
    <title>{title}</title>
    <meta name="description" content={description} />
    {children}
  </div>
);

export default PageContainer;
