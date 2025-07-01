import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function GET(_req: NextRequest) {
  try {
    const contract = await connectFabric('AdminContract');
    const result = await contract.evaluateTransaction('listAllEntities');
    const entities = JSON.parse(result.toString());

    const ongs = entities
      .filter((e: any) => e.type?.toLowerCase() === 'ong')
      .map((e: any) => ({
        id: e.id,
        name: e.name,
      }));

    return NextResponse.json({ ongs });
  } catch (err: any) {
    console.error('❌ Error al listar ONGs:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
