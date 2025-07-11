import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../../src/lib/hlf';
import { validateRole } from '../../../../../src/lib/auth/validationRole';


export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const body = await req.json();
    const { executionReport, address } = body;

    const { valid } = await validateRole(address, 'project');
    if (!valid) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const contract = await connectFabric('ProjectContract');
    await contract.submitTransaction('reportExecution', id, executionReport);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Error al reportar ejecución:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}