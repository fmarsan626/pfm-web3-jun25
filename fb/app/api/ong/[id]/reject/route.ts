import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

interface Params {
  params: { id: string };
}

export async function POST(_: NextRequest, { params }: Params) {
  try {
    const contract = await connectFabric('ONGContract');
    await contract.submitTransaction('rejectDonation', params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al rechazar donación:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
