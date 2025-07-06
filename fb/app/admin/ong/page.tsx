'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/context/Web3Context';

export default function CreateONGPage() {
    const { account } = useWeb3();
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
            const res = await fetch('/api/admin/ong', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: account, id, name, metadata, wallet }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('✅ ONG creada con éxito');
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
            <h1 className="text-2xl font-bold mb-6">Crear ONG</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">ID de la ONG</label>
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
                    <input
                        type="text"
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        required
                        className="w-full border p-2 rounded"
                    />
                </div>
                <button type="submit" disabled={loading || !account} className="bg-blue-600 text-white px-4 py-2 rounded">
                    {loading ? 'Creando...' : 'Crear ONG'}
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
