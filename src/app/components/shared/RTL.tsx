"use client";
import React, { useEffect } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';

interface RTLProps {
  children: React.ReactNode;
  direction: string;
}

const styleCache = () =>
  createCache({
    key: 'rtl',
    prepend: true,
    stylisPlugins: [rtlPlugin],
  });

const RTL: React.FC<RTLProps> = ({ children, direction }) => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.dir = direction;
    }
  }, [direction]);

  if (direction === 'rtl') {
    return <CacheProvider value={styleCache()}>{children}</CacheProvider>;
  }

  return <>{children}</>;
};

export default RTL;
