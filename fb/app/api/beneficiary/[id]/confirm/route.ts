import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../../src/lib/hlf';
import { validateRole } from '../../../../../src/lib/auth/validationRole';


interface Params {
  params: {
    id: string; // donationId
  };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: donationId } = params;
  const { address } = await req.json();
  const { valid } = await validateRole(address, 'beneficiary');
  if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });

  try {
    const { beneficiaryId, deliveryReport } = await req.json();

    const contract = await connectFabric('BeneficiaryContract');
    await contract.submitTransaction(
      'confirmDelivery',
      donationId,
      beneficiaryId,
      deliveryReport
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error confirmando entrega:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
