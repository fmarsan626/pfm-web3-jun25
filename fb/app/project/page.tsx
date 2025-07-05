'use client';

import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../src/context/Web3Context';
import { useEffect } from 'react';

export default function ProjectHome() {
  const { isConnected, account } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) router.push('/');
  }, [isConnected, router]);

  return (
    <main className="flex flex-col items-center mt-24 space-y-6">
      <h1 className="text-2xl font-bold">Panel del Proyecto</h1>
      <div className="space-y-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded"
          onClick={() => router.push('/project/confirm')}
        >
          Confirmar Recepción de Donaciones
        </button>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
          onClick={() => router.push('/project/assign')}
        >
          Asignar a Beneficiario
        </button>
        <button
          className="bg-purple-600 text-white px-6 py-2 rounded"
          onClick={() => router.push('/project/report')}
        >
          Reportar Uso de Donación
        </button>
      </div>
    </main>
  );
}
