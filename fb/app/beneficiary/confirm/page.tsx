'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function ConfirmDeliveryPage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!account) return;

    const fetchDonations = async () => {
      try {
        const res = await fetch(`/api/beneficiary/${account}/donations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: account }),
        }); const data = await res.json();

        if (data.success) {
          const pending = data.result
            .map((d: any) => ({ ...d, id: d.donationId ?? d.id }))
            .filter((d: any) => d.status?.replace(/_/g, ' ') === 'ASIGNADA A BENEFICIARIO'
            );
          setDonations(pending);
        } else {
          setMessage(`❌ Error: ${data.error}`);
        }
      } catch {
        setMessage('❌ Error al cargar donaciones');
      }
    };

    fetchDonations();
  }, [account]);

  const handleConfirm = async (donationId: string) => {
    const report = reports[donationId];
    if (!report) {
      setMessage('⚠️ Introduce un informe de entrega');
      return;
    }

    try {
      const res = await fetch(`/api/beneficiary/${donationId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account, deliveryReport: report }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Donación ${donationId} confirmada`);
        setDonations((prev) => prev.filter((d) => d.id !== donationId));
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch {
      setMessage('❌ Error al confirmar la entrega');
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Confirmar Recepción de Donaciones</h1>
      {message && <p className="mb-4 text-red-600">{message}</p>}

      {donations.map((donation) => (
        <div key={donation.donationId} className="mb-6 bg-gray-100 p-4 rounded shadow-sm">
          <p><strong>ID:</strong> {donation.donationId}</p>
          <p><strong>Cantidad:</strong> {donation.amount}</p>
          <p><strong>Estado:</strong> {donation.status}</p>
          {donation.metadata && (
            <p><strong>Metadata:</strong> {donation.metadata}</p>
          )}
          <textarea
            placeholder="Informe de entrega..."
            value={reports[donation.donationId] || ''}
            onChange={(e) =>
              setReports((prev) => ({ ...prev, [donation.donationId]: e.target.value }))
            }
            className="w-full mt-2 p-2 border rounded"
          />

          <button
            onClick={() => handleConfirm(donation.donationId)}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            Confirmar Entrega
          </button>
        </div>
      ))}
    </main>
  );
}

