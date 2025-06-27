import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const { executionReport } = await req.json();
    const contract = await connectFabric('ProjectContract');
    await contract.submitTransaction('reportExecution', id, executionReport);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Error al reportar ejecución:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
