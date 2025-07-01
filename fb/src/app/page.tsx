'use client';

import { useWeb3 } from '@/context/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isConnected } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Trazabilidad de una donación</h1>
      <p className="text-xl text-gray-600">
        Por favor, conecte una wallet
      </p>
    </main>
  );
}
