import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';
import { validateRole } from '../../../../src/lib/auth/validationRole';

export async function GET(_req: NextRequest) {
  const { address } = await _req.json();
  const { valid } = await validateRole(address, 'beneficiary');
  if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });

  try {
    const contract = await connectFabric('AdminContract');
    const result = await contract.evaluateTransaction('listAllEntities');
    const entities = JSON.parse(result.toString());

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
