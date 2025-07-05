'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function MyDonationsPage() {
  const { account, isConnected } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isConnected || !account) return;

    const fetchDonations = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/donor/my-donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ donor: account }),
        });

        const data = await res.json();
        if (data.success) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
          setDonations(data.result);
        } else {
          setError(data.error || 'Error al obtener donaciones');
        }
      } catch (err) {
        setError('Error en la conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [isConnected, account]);

  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Mis Donaciones</h1>

      {loading && <p className="text-gray-600">Cargando donaciones...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && donations.length === 0 && !error && (
        <p className="text-gray-500 text-center">No tienes donaciones registradas.</p>
      )}

      <ul className="space-y-4">
        {donations.map((donation) => (
          <li key={donation.id} className="p-4 border rounded bg-gray-100 text-sm">
            <p><strong>ID:</strong> {donation.id}</p>
            <p><strong>ONG:</strong> {donation.ongId}</p>
            <p><strong>Cantidad:</strong> {donation.amount}</p>
            <p><strong>Estado:</strong> {donation.status}</p>
            <p><strong>Metadata:</strong> {donation.metadata}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
