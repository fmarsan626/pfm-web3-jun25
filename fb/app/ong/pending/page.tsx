'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function PendingDonationsPage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      try {
        console.log("🔐 ONG solicitando pendientes:", account);
        const res = await fetch('/api/ong/pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ong: account }),
        });
        const data = await res.json();
        if (data.success) setDonations(data.result);
        else setMessage(data.error);
      } catch {
        setMessage('Error al obtener donaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [account]);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/ong/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account }),
      });

      const data = await res.json();
      if (data.success) {
        setDonations((prev) => prev.filter((d) => d.donationId !== id));
        setMessage(`✅ Donación ${action === 'accept' ? 'aceptada' : 'rechazada'}`);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage('Error en la solicitud');
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Donaciones Pendientes</h1>

      {loading && <p className="text-gray-500">Cargando...</p>}
      {message && <p className="text-red-600">{message}</p>}

      <ul className="space-y-4">
        {donations.map((donation) => (
          <li key={donation.donationId} className="bg-gray-100 p-4 rounded shadow-sm">
            <p><strong>ID:</strong> {donation.donationId}</p>
            <p><strong>Donante:</strong> {donation.donor}</p>
            <p><strong>Monto:</strong> {donation.amount}</p>
            <p><strong>Estado:</strong> {donation.status}</p>
            <p><strong>Metadata:</strong> {donation.metadata}</p>
            <p><strong>Fecha:</strong> {new Date(donation.timestamp).toLocaleString()}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleAction(donation.donationId, 'accept')}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Aceptar
              </button>
              <button
                onClick={() => handleAction(donation.donationId, 'reject')}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Rechazar
              </button>
            </div>
          </li>
        ))}

      </ul>
      <button
        onClick={() => window.history.back()}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        ← Atrás
      </button>
    </main>
  );
}
