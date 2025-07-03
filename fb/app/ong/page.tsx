'use client';

import { useRouter } from 'next/navigation';

export default function OngDashboard() {
  const router = useRouter();

  return (
    <main className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Panel ONG</h1>

      <div className="space-y-4">
        <button
          onClick={() => router.push('/ong/pending')}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
        >
          Donaciones pendientes
        </button>

        <button
          onClick={() => router.push('/ong/assign')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Asignar donación a proyecto
        </button>

        <button
          onClick={() => router.push('/ong/unassigned')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
        >
          Donaciones sin asignar
        </button>

        <button
          onClick={() => router.push('/ong/all')}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded"
        >
          Ver todas las donaciones
        </button>
      </div>
    </main>
  );
}
