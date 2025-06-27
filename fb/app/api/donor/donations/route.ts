import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest) {
  try {
    const { donationId, metadata, ongId } = await req.json();

    const contract = await connectFabric('DonorContract');
    const result = await contract.submitTransaction('registerDonation', donationId, metadata, ongId);

    return NextResponse.json({ success: true, result: result.toString() });
  } catch (error: any) {
    console.error('Error creando donación:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
