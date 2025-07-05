'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function ConfirmDonationsPage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      if (!account) return;

      try {
        const res = await fetch('/api/project/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: account }),
        });
        const data = await res.json();

        if (data.success) {
          const projectInfoRes = await fetch(`/api/roles/wallet?address=${account}`);
          const projectInfo = await projectInfoRes.json();
          const projectId = projectInfo.id;

          const filtered = data.result.filter(
            (d: any) =>
              d.assignedProjectId?.toLowerCase() === projectId?.toLowerCase() &&
              d.status === 'ASIGNADA_A_PROYECTO'
          );

          setDonations(filtered);
        } else {
          setMessage(`⚠️ ${data.error}`);
        }
      } catch (error) {
        setMessage('❌ Error al cargar donaciones');
      }
    };

    fetchDonations();
  }, [account]);

  const handleConfirm = async (donationId: string) => {
    try {
      const res = await fetch(`/api/project/${donationId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Donación ${donationId} confirmada`);
        setDonations((prev) => prev.filter((d) => d.donationId !== donationId));
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch {
      setMessage('❌ Error al confirmar donación');
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Confirmar Recepción de Donaciones</h1>
      {message && <p className="mb-4 text-red-600">{message}</p>}

      <ul className="space-y-4">
        {donations.map((donation) => (
          <li key={donation.donationId} className="bg-gray-100 p-4 rounded shadow-sm">
            <p><strong>ID:</strong> {donation.donationId}</p>
            <p><strong>Cantidad:</strong> {donation.amount}</p>
            <p><strong>Donante:</strong> {donation.donor}</p>
            <p><strong>Metadata:</strong> {donation.metadata || '—'}</p>
            <p><strong>Fecha:</strong> {new Date(donation.timestamp).toLocaleString()}</p>

            <button
              onClick={() => handleConfirm(donation.donationId)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Confirmar Recepción
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
