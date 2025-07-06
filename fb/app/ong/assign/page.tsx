'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../../../src/context/Web3Context';

export default function AssignDonationsPage() {
  const { account } = useWeb3();
  const [donations, setDonations] = useState<any[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!account) return;

      try {

        const [donationsRes, projectsRes] = await Promise.all([
          fetch('/api/ong/unassigned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ong: account }),
          }),
          fetch('/api/project/list')
        ]);

        const donationsData = await donationsRes.json();
        const projectsData = await projectsRes.json();

        console.log('📦 Proyectos recibidos en el frontend:', projectsData);

        if (donationsData.success) setDonations(donationsData.result);
        if (projectsData.success) setProjects(projectsData.projects || []);
      } catch (error) {
        setMessage('❌ Error al cargar datos');
        console.error(error);
      }
    };

    fetchData();
  }, [account]);

  const handleAssign = async (donationId: string) => {
    const projectId = projectMap[donationId];
    if (!projectId) {
      setMessage('⚠️ Selecciona un proyecto');
      return;
    }

    try {
      const res = await fetch(`/api/ong/${donationId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, address: account }),
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
      <h1 className="text-xl font-bold mb-6 text-center">Asignar Donaciones a Proyectos</h1>
      {message && <p className="mb-4 text-red-600">{message}</p>}

      <ul className="space-y-4">
        {donations.map((donation) => (
          <li key={donation.donationId} className="bg-gray-100 p-4 rounded shadow-sm">
            <p><strong>ID:</strong> {donation.donationId}</p>
            <p><strong>Cantidad:</strong> {donation.amount}</p>
            <p><strong>Donante:</strong> {donation.donor}</p>
            <p><strong>Metadata:</strong> {donation.metadata}</p>
            <p><strong>Fecha:</strong> {new Date(donation.timestamp).toLocaleString()}</p>

            <div className="mt-2 flex gap-2 items-center">
              <select
                value={projectMap[donation.donationId] || ''}
                onChange={(e) =>
                  setProjectMap((prev) => ({ ...prev, [donation.donationId]: e.target.value }))
                }
                className="flex-1 border p-2 rounded"
              >
                <option value="">-- Selecciona un proyecto --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.id})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAssign(donation.donationId)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
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
