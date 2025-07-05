'use client';

import { useRouter } from 'next/navigation';

export default function BeneficiaryHomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Beneficiario</h1>

      <div className="space-y-4 w-full max-w-sm">
        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => router.push('/beneficiary/donations')}
        >
          📦 Ver Donaciones Recibidas
        </button>

        <button
          className="w-full bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => router.push('/beneficiary/confirm')}
        >
          ✅ Confirmar Entrega de Donaciones
        </button>
      </div>
    </main>
  );
}
