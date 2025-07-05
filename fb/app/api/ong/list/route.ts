import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';


export async function GET(_req: NextRequest) {


  try {
    const contract = await connectFabric('AdminContract');
    const result = await contract.evaluateTransaction('listAllEntities');
    const raw = Buffer.from(result).toString('utf8');
    console.log('📦 ONG JSON Raw:', raw);

    const entities = JSON.parse(raw);
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
