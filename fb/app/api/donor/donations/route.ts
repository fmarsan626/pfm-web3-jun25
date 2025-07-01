import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest) {
  try {
    const { id, amount, metadata, ongId, donor } = await req.json();

    if (!id || !amount || !metadata || !ongId || !donor) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const contract = await connectFabric('DonorContract');
    const result = await contract.submitTransaction(
      'registerDonation',
      id,
      amount.toString(),
      metadata,
      ongId,
      donor
    );

    return NextResponse.json({ success: true, result: JSON.parse(result.toString()) }, { status: 200 });
  } catch (error: any) {
    console.error('Error creando donación:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
