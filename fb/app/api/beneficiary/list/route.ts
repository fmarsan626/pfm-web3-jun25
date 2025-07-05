import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';

export async function POST(req: NextRequest) {
  const { address } = await req.json();

  try {
    const contract = await connectFabric('AdminContract');
    const result = await contract.evaluateTransaction('listAllEntities');
    
    const decoded = decodeByteString(result.toString());
    //console.log('🔍 Texto decodificado:', decoded);
    const entities = JSON.parse(decoded.toString());

    const beneficiaries = entities
      .filter((e: any) => e.type?.toLowerCase() === 'beneficiary')
      .map((e: any) => ({
        id: e.id,
        name: e.name,
      }));

    return NextResponse.json({ success: true, beneficiaries });
  } catch (err: any) {
    console.error('❌ Error al listar beneficiarios:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
function decodeByteString(byteString: string): string {
  try {
    const bytes = byteString
      .split(',')
      .map(b => parseInt(b.trim()))
      .filter(n => !isNaN(n)); 

    return Buffer.from(bytes).toString('utf-8');
  } catch (e) {
    console.error('❌ Error al decodificar byteString:', e);
    return '';
  }
}