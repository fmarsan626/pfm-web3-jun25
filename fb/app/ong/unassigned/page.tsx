'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';

export default function UnassignedDonationsPage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnassigned = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ong/unassigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ong: account }),
        });
        const data = await res.json();
        if (data.success) {
          setDonations(data.result);
        } else {
          setMessage(data.error);
        }
      } catch {
        setMessage('Error al cargar donaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchUnassigned();
  }, [account]);

  const handleAssign = async (donationId: string) => {
    const projectId = projectMap[donationId];
    if (!projectId) {
      setMessage('⚠️ Debes ingresar un ID de proyecto');
      return;
    }

    try {
      const res = await fetch(`/api/ong/${donationId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Donación ${donationId} asignada`);
        setDonations((prev) => prev.filter((d) => d.id !== donationId));
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch {
      setMessage('❌ Error al asignar donación');
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Donaciones sin Asignar</h1>

      {loading && <p className="text-gray-500">Cargando...</p>}
      {message && <p className="text-red-600">{message}</p>}

      <ul className="space-y-4">
        {donations.map((donation) => (
          <li key={donation.id} className="bg-gray-100 p-4 rounded shadow-sm">
            <p><strong>ID:</strong> {donation.id}</p>
            <p><strong>Donante:</strong> {donation.donor}</p>
            <p><strong>Cantidad:</strong> {donation.amount}</p>

            <div className="mt-2 flex gap-2 items-center">
              <input
                type="text"
                placeholder="ID del Proyecto"
                value={projectMap[donation.id] || ''}
                onChange={(e) =>
                  setProjectMap((prev) => ({ ...prev, [donation.id]: e.target.value }))
                }
                className="flex-1 border p-2 rounded"
              />
              <button
                onClick={() => handleAssign(donation.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Asignar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
