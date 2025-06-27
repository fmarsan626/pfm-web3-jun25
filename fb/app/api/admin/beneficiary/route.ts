import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest) {
  try {
    const { id, name, metadata } = await req.json();

    const contract = await connectFabric('AdminContract');
    await contract.submitTransaction('createBeneficiary', id, name, metadata);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Error al crear beneficiario:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

