'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function AllDonationsPage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      if (!account) return;

      try {
        const res = await fetch(`/api/ong/${account}/donations`);
        const data = await res.json();
        if (data.success) {
          setDonations(data.result);
        } else {
          setMessage(`⚠️ ${data.error}`);
        }
      } catch (error) {
        setMessage('❌ Error al cargar donaciones');
        console.error(error);
      }
    };

    fetchDonations();
  }, [account]);


  return (
    <main className="max-w-2xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-6 text-center">Todas las Donaciones</h1>
      {message && <p className="text-red-600">{message}</p>}

      <ul className="space-y-4">
        {donations.map((donation) => (
          <li key={donation.id} className="bg-gray-100 p-4 rounded shadow-sm">
            <p><strong>ID:</strong> {donation.id}</p>
            <p><strong>Estado:</strong> {donation.status}</p>
            <p><strong>Donante:</strong> {donation.donor}</p>
            <p><strong>Proyecto asignado:</strong> {donation.assignedProjectId || '—'}</p>
            <p><strong>ONG:</strong> {donation.ongId}</p>
            <p><strong>Cantidad:</strong> {donation.amount}</p>
            <p><strong>Metadata:</strong> {donation.metadata}</p>
            <p><strong>Estado:</strong> {donation.status}</p>
            <p><strong>Beneficiario:</strong> {donation.beneficiaryId || 'No asignado'}</p>
            <p><strong>Reporte del beneficiario:</strong> {donation.deliveryReport || 'Sin reporte'}</p>
            <p><strong>Reporte del proyecto:</strong> {donation.executionReport || 'Sin reporte'}</p>
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

