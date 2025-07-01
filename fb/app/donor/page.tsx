'use client';

import { useRouter } from 'next/navigation';

export default function DonorPage() {
  const router = useRouter();

  return (
    <main className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Panel del Donante</h1>
      <div className="space-y-4">
        <button
          onClick={() => router.push('/donor/create')}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded"
        >
          Crear Donación
        </button>
        <button
          onClick={() => router.push('/donor/consult')}
          className="w-full bg-green-600 text-white px-4 py-2 rounded"
        >
          Consultar Donación por ID
        </button>
        <button
          onClick={() => router.push('/donor/donations')}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded"
        >
          Ver Mis Donaciones
        </button>
      </div>
    </main>
  );
}
 