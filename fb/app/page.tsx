'use client';

import { useWeb3 } from '../src/context/Web3Context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ADMIN_WALLET = '0xc31d5ecdc839e1cd8a8489d8d78335a07ad82425';

export default function Home() {
  const { isConnected, account } = useWeb3();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !account) return;

    const checkAccess = async () => {
      setLoading(true);
      const normalized = account.toLowerCase();

      if (normalized === ADMIN_WALLET.toLowerCase()) {
        router.push('/admin');
        return;
      }

      try {
        const res = await fetch(`/api/roles/wallet?address=${normalized}`);
        const { role } = await res.json();

        if (role) {
          router.push(`/${role}`);
        } else {
          router.push('/donor');
        }
      } catch (err) {
        console.error('Error verificando el rol:', err);
        router.push('/donor');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [isConnected, account, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Trazabilidad de una donación</h1>
      <p className="text-xl text-gray-600">
        {loading
          ? 'Cargando rol y redireccionando...'
          : 'Por favor, conecte una wallet'}
      </p>
    </main>
  );
}