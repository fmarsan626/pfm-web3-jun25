import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';
import { validateRole } from '../../../../src/lib/auth/validationRole';


export async function GET(_req: NextRequest) {
  const { address } = await _req.json();
  const { valid } = await validateRole(address, 'project');
  if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });

  try {
    const contract = await connectFabric('ProjectContract');
    const result = await contract.evaluateTransaction('listProjectDonations');
    const parsed = JSON.parse(result.toString());

    return NextResponse.json({ success: true, result: parsed });
  } catch (err: any) {
    console.error('❌ Error al listar donaciones del proyecto:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
