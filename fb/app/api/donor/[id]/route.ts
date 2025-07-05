import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const contract = await connectFabric('DonorContract');
    const result = await contract.evaluateTransaction('getDonation', params.id);
    const decoded = decodeByteString(result.toString());
    const parsed = JSON.parse(decoded);
    return NextResponse.json({ success: true, result: parsed });

  } catch (error: any) {
    console.error('Error obteniendo donación:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function decodeByteString(byteString: string): string {
  const bytes = byteString.split(',').map(b => parseInt(b.trim()));
  return Buffer.from(bytes).toString('utf-8');
}
