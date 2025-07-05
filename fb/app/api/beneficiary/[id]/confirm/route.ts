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
  const { address, deliveryReport } = await req.json();

  const { valid } = await validateRole(address, 'beneficiary');
  if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });

  try {
    const adminContract = await connectFabric('AdminContract');
    const entitiesRaw = await adminContract.evaluateTransaction('listAllEntities');
    const decoded = decodeByteString(entitiesRaw.toString());
    const entities = JSON.parse(decoded);

    const beneficiary = entities.find(
      (e: any) => e.type?.toLowerCase() === 'beneficiary' && e.wallet?.toLowerCase() === address.toLowerCase()
    );

    if (!beneficiary) {
      return NextResponse.json({ success: false, error: 'Beneficiario no encontrado' }, { status: 404 });
    }

    const beneficiaryId = beneficiary.id;

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

function decodeByteString(byteString: string): string {
  const bytes = byteString
    .split(',')
    .map(b => parseInt(b.trim()))
    .filter(n => !isNaN(n));

  return Buffer.from(bytes).toString('utf-8');
}
