import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

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
