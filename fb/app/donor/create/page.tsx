'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function CreateDonationPage() {
  const [id, setId] = useState('');
  const [amount, setAmount] = useState('');
  const [metadata, setMetadata] = useState('');
  const [ongId, setOngId] = useState('');
  const [ongs, setOngs] = useState<{ id: string; name: string }[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { account } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    // Cargar lista de ONGs desde el backend
    const fetchOngs = async () => {
      try {
        const res = await fetch('/api/ong/list');
        const data = await res.json();
        setOngs(data.ongs || []);
      } catch (err) {
        console.error('Error al cargar ONGs:', err);
      }
    };

    fetchOngs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/donor/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          amount,
          metadata,
          donor: account,
          ongId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Donación registrada con éxito');
        setTimeout(() => router.push('/donor'), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Error en la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Registrar Donación</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">ID de la Donación</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Cantidad</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Metadata (JSON)</label>
          <textarea
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Seleccionar ONG</label>
          <select
            value={ongId}
            onChange={(e) => setOngId(e.target.value)}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">-- Selecciona una ONG --</option>
            {ongs.map((ong) => (
              <option key={ong.id} value={ong.id}>
                {ong.name} ({ong.id})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Registrando...' : 'Registrar Donación'}
        </button>
        {message && <p className="mt-4">{message}</p>}
        <button
          onClick={() => window.history.back()}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          ← Atrás
        </button>
      </form>
    </main>
  );
}
