'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateBeneficiaryPage() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [metadata, setMetadata] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/beneficiary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, metadata, wallet }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Beneficiario creado con éxito');
        setTimeout(() => router.push('/admin'), 1500);
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
      <h1 className="text-2xl font-bold mb-6">Registrar Beneficiario</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">ID del Beneficiario</label>
          <input type="text" value={id} onChange={e => setId(e.target.value)} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1">Nombre</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1">Metadata (JSON)</label>
          <textarea value={metadata} onChange={e => setMetadata(e.target.value)} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1">Dirección de Wallet</label>
          <input type="text" value={wallet} onChange={e => setWallet(e.target.value)} required className="w-full border p-2 rounded" />
        </div>
        <button type="submit" disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded">
          {loading ? 'Creando...' : 'Crear Beneficiario'}
        </button>
        {message && <p className="mt-4">{message}</p>}
      </form>
    </main>
  );
}
