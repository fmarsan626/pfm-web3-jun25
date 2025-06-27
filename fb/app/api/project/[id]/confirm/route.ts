import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const contract = await connectFabric('ProjectContract');
    await contract.submitTransaction('confirmReceipt', id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Error confirmando recibo:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

