import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';
import { validateRole } from '../../../../src/lib/auth/validationRole';



export async function POST(req: NextRequest) {
  try {
    const { address, id, name, metadata, wallet } = await req.json();
    console.log("🔍 Dirección recibida:", address);

    const { valid } = await validateRole(address, 'admin');
    if (!valid) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const contract = await connectFabric('AdminContract');
    await contract.submitTransaction('createONG', id, name, metadata, wallet);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Error al crear ONG:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
