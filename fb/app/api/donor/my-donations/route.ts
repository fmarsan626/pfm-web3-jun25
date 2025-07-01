import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest) {
  try {
    const { donor } = await req.json();

    if (!donor) {
      return NextResponse.json({ success: false, error: 'Falta la dirección del donante' }, { status: 400 });
    }

    const contract = await connectFabric('DonorContract');
    const result = await contract.evaluateTransaction('listMyDonations', donor);
    const parsed = JSON.parse(result.toString());

    return NextResponse.json({ success: true, result: parsed });
  } catch (err: any) {
    console.error('❌ Error al listar donaciones del donante:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
