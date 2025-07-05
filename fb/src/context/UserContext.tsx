'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import { useRouter } from 'next/navigation';

interface UserContextType {
  role: string | null;
  id: string | null;
}

const UserContext = createContext<UserContextType>({
  role: null,
  id: null,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { isConnected, account } = useWeb3();
  const [role, setRole] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();

  const ADMIN_WALLET = '0xc31d5ecdc839e1cd8a8489d8d78335a07ad82425';

  useEffect(() => {
    const checkAccess = async () => {
      if (!isConnected || !account) {
        setRole(null);
        setId(null);
        router.push('/');
        return;
      }

      const normalized = account.toLowerCase();

      if (normalized === ADMIN_WALLET.toLowerCase()) {
        setRole('admin');
        setId('admin'); 
        router.push('/admin');
        return;
      }

      try {
        const res = await fetch(`/api/roles/wallet?address=${normalized}`);
        const data = await res.json();

        if (data.role && data.id) {
          setRole(data.role);
          setId(data.id);
          router.push(`/${data.role}`);
        } else {
          setRole('donor');
          setId(null);
          router.push('/donor');
        }
      } catch (err) {
        console.error('Error al consultar rol:', err);
        setRole('donor');
        setId(null);
        router.push('/donor');
      }
    };

    checkAccess();
  }, [isConnected, account, router]);

  return (
    <UserContext.Provider value={{ role, id }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
