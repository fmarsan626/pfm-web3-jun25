'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function ReceivedDonationsPage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
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
          setDonations(data.result || []);
        } else {
          setMessage(`❌ Error: ${data.error}`);
        }
      } catch {
        setMessage('❌ No se pudieron cargar las donaciones');
      }
    };

    fetchDonations();
  }, [account]);

  return (
    <main className="max-w-3xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Donaciones Recibidas</h1>

      {message && <p className="mb-4 text-red-600">{message}</p>}

      {donations.length === 0 ? (
        <p className="text-gray-600 text-center">No se encontraron donaciones.</p>
      ) : (
        <ul className="space-y-4">
          {donations.map((donation) => (
            <li key={donation.donationId} className="bg-gray-100 p-4 rounded shadow-sm">
              <p><strong>ID:</strong> {donation.donationId}</p>
              <p><strong>Cantidad:</strong> {donation.amount}</p>
              <p><strong>Estado:</strong> {donation.status}</p>
              {donation.metadata && (
                <p><strong>Metadata:</strong> {donation.metadata}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => window.history.back()}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        ← Atrás
      </button>
    </main>
  );
}
