import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';


export async function POST(req: NextRequest) {
  try {
    const { id, name, metadata, wallet } = await req.json();

    const contract = await connectFabric('AdminContract');
    await contract.submitTransaction('createONG', id, name, metadata, wallet);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Error al crear ONG:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
