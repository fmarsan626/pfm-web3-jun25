import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';


export async function GET(_req: NextRequest) {
  try {
    const contract = await connectFabric('AdminContract');
    const result = await contract.evaluateTransaction('listAllEntities');

    const decoded = decodeByteString(result.toString());
    const entities = JSON.parse(decoded);

    const projects = entities
      .filter((e: any) => e.type?.toLowerCase() === 'project')
      .map((e: any) => ({ id: e.id, name: e.name }));

    return NextResponse.json({ success: true, projects });
  } catch (err: any) {
    console.error('❌ Error al listar proyectos:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function decodeByteString(byteString: string): string {
  const bytes = byteString.split(',').map((b) => parseInt(b.trim()));
  return Buffer.from(bytes).toString('utf-8');
}
