'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function ReportDonationUsagePage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [reports, setReports] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      if (!account) return;

      try {
        const res = await fetch('/api/project/donations');
        const data = await res.json();

        if (data.success) {
          const filtered = data.result.filter(
            (d: any) =>
              d.assignedProjectId?.toLowerCase() === account.toLowerCase() &&
              d.status === 'ASIGNADA_A_BENEFICIARIO'
          );
          setDonations(filtered);
        }
      } catch {
        setMessage('❌ Error al cargar donaciones');
      }
    };

    fetchDonations();
  }, [account]);

  const handleReport = async (donationId: string) => {
    const executionReport = reports[donationId];
    if (!executionReport) {
      setMessage('⚠️ Introduce un informe para enviar');
      return;
    }

    try {
      const res = await fetch(`/api/project/${donationId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionReport }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Informe enviado para ${donationId}`);
        setDonations((prev) => prev.filter((d) => d.id !== donationId));
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch {
      setMessage('❌ Error al enviar el informe');
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Reportar Uso de Donaciones</h1>
      {message && <p className="mb-4 text-red-600">{message}</p>}

      {donations.map((donation) => (
        <div key={donation.id} className="mb-6 bg-gray-100 p-4 rounded shadow-sm">
          <p><strong>ID:</strong> {donation.id}</p>
          <p><strong>Cantidad:</strong> {donation.amount}</p>
          <p><strong>Beneficiario:</strong> {donation.assignedBeneficiaryId || 'No asignado'}</p>

          <textarea
            placeholder="Informe de uso..."
            value={reports[donation.id] || ''}
            onChange={(e) =>
              setReports((prev) => ({ ...prev, [donation.id]: e.target.value }))
            }
            className="w-full mt-2 p-2 border rounded"
          />

          <button
            onClick={() => handleReport(donation.id)}
            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Enviar Informe
          </button>
        </div>
      ))}
    </main>
  );
}
