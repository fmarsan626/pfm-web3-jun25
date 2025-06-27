import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function GET(_req: NextRequest) {
  try {
    const contract = await connectFabric('ProjectContract');
    const result = await contract.evaluateTransaction('listProjectDonations');
    const parsed = JSON.parse(result.toString());

    return NextResponse.json({ success: true, result: parsed });
  } catch (err: any) {
    console.error('❌ Error al listar donaciones del proyecto:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
