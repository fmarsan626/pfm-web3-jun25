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

      const res = await fetch(`/api/roles/wallet?address=${account}`);
      const data = await res.json();
      const projectId = data.id;

      try {
        const [donRes, benRes] = await Promise.all([
          fetch('/api/project/donations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: account }),
          }),
          fetch('/api/beneficiary/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: account })
          }),
        ]);

        const donData = await donRes.json();
        const benData = await benRes.json();
        //console.log('🧾 Donaciones recibidas:', donData);
        //console.log('🧾 Beneficiarios recibidos:', benData);

        if (donData.success) {
          const filtered = donData.result.filter(
            (d: any) =>
              d.assignedProjectId?.toLowerCase() === projectId.toLowerCase() &&
              d.status === 'RECIBIDA_POR_PROYECTO'
          );
          //console.log('🧾 Donaciones filtradas:', filtered);

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
        body: JSON.stringify({ beneficiaryId, address: account }),
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
          <li key={donation.donationId} className="bg-gray-100 p-4 rounded shadow-sm">
            <p><strong>ID:</strong> {donation.donationId}</p>
            <p><strong>Cantidad:</strong> {donation.amount}</p>
            <p><strong>Metadata:</strong> {donation.metadata}</p>
            <p><strong>Fecha:</strong> {new Date(donation.timestamp).toLocaleString()}</p>

            <div className="mt-2 flex gap-2 items-center">
              <select
                value={beneficiaryMap[donation.donationId] || ''}
                onChange={(e) =>
                  setBeneficiaryMap((prev) => ({ ...prev, [donation.donationId]: e.target.value }))
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
                onClick={() => handleAssign(donation.donationId)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Asignar
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
