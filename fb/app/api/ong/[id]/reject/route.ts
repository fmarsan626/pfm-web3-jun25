import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../../src/lib/hlf';
import { validateRole } from '../../../../../src/lib/auth/validationRole';


interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { address } = await req.json();
  const { valid } = await validateRole(address, 'ong');
  if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });


  try {
    const contract = await connectFabric('ONGContract');
    await contract.submitTransaction('rejectDonation', params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al rechazar donación:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
