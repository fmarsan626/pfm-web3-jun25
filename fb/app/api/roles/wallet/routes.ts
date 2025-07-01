import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address')?.toLowerCase();

  if (!address) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const contract = await connectFabric('AdminContract');
    const iterator = await contract.evaluateTransaction('listAllEntities');

    const entities = JSON.parse(iterator.toString());
    for (const entity of entities) {
      if (entity.wallet?.toLowerCase() === address) {
        return NextResponse.json({
          role: entity.type?.toLowerCase() || 'unknown',
          id: entity.id,
        });
      }
    }

    return NextResponse.json({ role: null, id: null });
  } catch (err: any) {
    console.error('❌ Error al verificar wallet:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
