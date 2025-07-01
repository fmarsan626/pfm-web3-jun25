import { NextRequest, NextResponse } from 'next/server';

const nonces: Record<string, string> = {}; // 🔐 temporal, idealmente usar Redis o DB

function generateNonce(): string {
  return Math.floor(Math.random() * 1000000).toString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  const nonce = generateNonce();
  nonces[address.toLowerCase()] = nonce;

  return NextResponse.json({ nonce });
}

// Export for use in signature verification later
export { nonces };
