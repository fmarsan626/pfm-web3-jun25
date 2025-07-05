
export async function validateRole(address: string, requiredRole: string): Promise<{ valid: boolean; id?: string }> {
  if (!address) return { valid: false };

  const normalized = address.toLowerCase();

  // Dirección hardcodeada del admin
  const ADMIN = '0xc31d5ecdc839e1cd8a8489d8d78335a07ad82425';

  if (requiredRole === 'admin') {
    console.log("🔐 Validando admin:", normalized === ADMIN, normalized, ADMIN);

    return { valid: normalized === ADMIN, id: normalized === ADMIN ? 'admin' : undefined };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/roles/wallet?address=${normalized}`);
    const data = await res.json();

    if (data.role === requiredRole) {
      return { valid: true, id: data.id };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}
