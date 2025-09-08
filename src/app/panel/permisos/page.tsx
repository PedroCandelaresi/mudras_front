'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PermisosPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/panel/usuarios?tab=2');
  }, [router]);
  return null;
}
