'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function AssignToBeneficiaryPage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<{ id: string; name: string }[]>([]);
  const [beneficiaryMap, setBeneficiaryMap] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!account) return;

      try {
        const [donRes, benRes] = await Promise.all([
          fetch('/api/project/donations'),
          fetch('/api/beneficiary/list'),
        ]);

        const donData = await donRes.json();
        const benData = await benRes.json();

        if (donData.success) {
          const filtered = donData.result.filter(
            (d: any) =>
              d.assignedProjectId?.toLowerCase() === account.toLowerCase() &&
              d.status === 'RECIBIDA_POR_PROYECTO'
          );
          setDonations(filtered);
        }

        if (benData.success) {
          setBeneficiaries(benData.beneficiaries || []);
        }
      } catch (error) {
        setMessage('❌ Error al cargar datos');
      }
    };

    fetchData();
  }, [account]);

  const handleAssign = async (donationId: string) => {
    const beneficiaryId = beneficiaryMap[donationId];
    if (!beneficiaryId) {
      setMessage('⚠️ Selecciona un beneficiario');
      return;
    }

    try {
      const res = await fetch(`/api/project/${donationId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beneficiaryId }),
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
      <h1 className="text-xl font-bold mb-6 text-center">Asignar Donaciones a Beneficiarios</h1>
      {message && <p className="mb-4 text-red-600">{message}</p>}

      <ul className="space-y-4">
        {donations.map((donation) => (
          <li key={donation.id} className="bg-gray-100 p-4 rounded shadow-sm">
            <p><strong>ID:</strong> {donation.id}</p>
            <p><strong>Cantidad:</strong> {donation.amount}</p>

            <div className="mt-2 flex gap-2 items-center">
              <select
                value={beneficiaryMap[donation.id] || ''}
                onChange={(e) =>
                  setBeneficiaryMap((prev) => ({ ...prev, [donation.id]: e.target.value }))
                }
                className="flex-1 border p-2 rounded"
              >
                <option value="">-- Selecciona un beneficiario --</option>
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.id})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAssign(donation.id)}
                className="bg-green-600 text-white px-4 py-2 rounded"
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
