'use client';

import { useWeb3 } from '@/context/Web3Context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_ADDRESS = '0xc31d5ecdc839e1cd8a8489d8d78335a07ad82425';

export default function AdminPage() {
  const { isConnected, account } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) return;

    if (account?.toLowerCase() !== ADMIN_ADDRESS) {
      router.push('/'); // 
    }
  }, [isConnected, account, router]);

  return (
    <main className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Panel de Administrador</h1>
      <div className="space-y-4">
        <button
          onClick={() => router.push('/admin/ong')}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded"
        >
          Crear ONG
        </button>
        <button
          onClick={() => router.push('/admin/project')}
          className="w-full bg-green-600 text-white px-4 py-2 rounded"
        >
          Crear Proyecto
        </button>
        <button
          onClick={() => router.push('/admin/beneficiary')}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded"
        >
          Crear Beneficiario
        </button>
      </div>
    </main>
  );
}
