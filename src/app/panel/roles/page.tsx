'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RolesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/panel/usuarios?tab=1');
  }, [router]);
  return null;
}
