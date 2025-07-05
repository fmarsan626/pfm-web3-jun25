import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';

export async function POST(req: NextRequest) {
  try {
    const { donor } = await req.json();

    if (!donor) {
      return NextResponse.json({ success: false, error: 'Falta la dirección del donante' }, { status: 400 });
    }

    const contract = await connectFabric('DonorContract');
    const result = await contract.evaluateTransaction('listMyDonations', donor);
    


    const raw = Buffer.from(result).toString('utf8');
    console.log('📦 Resultado raw getDonationsByDonor:', raw);

    return NextResponse.json({ success: true, result: JSON.parse(raw) }, { status: 200 });
  } catch (err: any) {
    console.error('❌ Error al listar donaciones del donante:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
