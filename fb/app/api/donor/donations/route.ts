import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest) {
  try {
    const { donationId, metadata, ongId } = await req.json();

    const contract = await connectFabric('DonorContract');
    const result = await contract.submitTransaction('registerDonation', donationId, metadata, ongId);

    const decoded = decodeByteString(result.toString());
    const parsed = JSON.parse(decoded);
    return NextResponse.json({ success: true, result: parsed }, { status: 200 });
  } catch (error: any) {
    console.error('Error creando donación:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function decodeByteString(byteString: string): string {
  const bytes = byteString.split(',').map(b => parseInt(b.trim()));
  return Buffer.from(bytes).toString('utf-8');
}