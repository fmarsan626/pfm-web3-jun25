'use client';

import { useState } from 'react';

export default function ConsultDonationPage() {
  const [donationId, setDonationId] = useState('');
  const [donation, setDonation] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDonation(null);
    setError('');

    try {
      const res = await fetch(`/api/donor/${donationId}`);
      const data = await res.json();

      if (data.success) {
        setDonation(data.result);
      } else {
        setError(data.error || 'Donación no encontrada');
      }
    } catch {
      setError('Error al consultar la donación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Consultar Donación</h1>
      <form onSubmit={handleSearch} className="space-y-4">
        <input
          type="text"
          placeholder="ID de la Donación"
          value={donationId}
          onChange={(e) => setDonationId(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Buscando...' : 'Consultar'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {donation && (
        <div className="mt-6 bg-gray-100 p-4 rounded text-sm">
          <pre>{JSON.stringify(donation, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}
