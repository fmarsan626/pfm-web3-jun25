import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../../src/lib/hlf';
import { validateRole } from '../../../../../src/lib/auth/validationRole';

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const { address } = await req.json();
  const { valid } = await validateRole(address, 'project');
  if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });


  try {
    const { beneficiaryId } = await req.json();
    const contract = await connectFabric('ProjectContract');
    await contract.submitTransaction('assignDonationToBeneficiary', id, beneficiaryId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Error al asignar donación a beneficiario:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
