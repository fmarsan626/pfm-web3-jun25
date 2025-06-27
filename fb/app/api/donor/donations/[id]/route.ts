import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const contract = await connectFabric('DonorContract');
    const result = await contract.evaluateTransaction('getDonation', params.id);

    return NextResponse.json({ success: true, result: JSON.parse(result.toString()) });
  } catch (error: any) {
    console.error('Error obteniendo donación:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
