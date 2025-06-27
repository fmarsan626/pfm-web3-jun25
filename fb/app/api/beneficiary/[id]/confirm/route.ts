import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

interface Params {
  params: {
    id: string; // donationId
  };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: donationId } = params;

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
