import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';
import { validateRole } from '../../../../src/lib/auth/validationRole';

export async function POST(req: NextRequest) {
  const { address } = await req.json();
  const { valid } = await validateRole(address, 'project');
  if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });

  try {
    const contract = await connectFabric('ProjectContract');
    const result = await contract.evaluateTransaction('listProjectDonations');

    
    const decoded = decodeByteString(result.toString());
    const parsed = JSON.parse(decoded);
    //console.log('Donaciones del proyecto:', parsed);
    return NextResponse.json({ success: true, result: parsed });
  } catch (err: any) {
    console.error('❌ Error al listar donaciones del proyecto:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function decodeByteString(byteString: string): string {
  const bytes = byteString.split(',').map(b => parseInt(b.trim()));
  return Buffer.from(bytes).toString('utf-8');
}