import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';
import { validateRole } from '../../../../src/lib/auth/validationRole';


export async function POST(req: NextRequest) {


  try {
    const { ong: wallet } = await req.json();
    //console.log("✅ wallet:", wallet);
    const roleInfo = await validateRole(wallet, 'ong');
    if (!roleInfo.valid || !roleInfo.id) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const ongId = roleInfo.id;
    //console.log(`📤 Llamando al contrato con ONG ID: ${ongId}`);


    const contract = await connectFabric('ONGContract');
    const result = await contract.evaluateTransaction('listUnassignedDonations', ongId);
    //console.log("✅ Donaciones sin asignar:", result);
    const decoded = decodeByteString(result.toString());
    const parsed = JSON.parse(decoded);
    //console.log("✅ Donaciones sin asignar:", parsed);
    return NextResponse.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Error al listar donaciones sin asignar:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function decodeByteString(byteString: string): string {
  const bytes = byteString.split(',').map(b => parseInt(b.trim()));
  return Buffer.from(bytes).toString('utf-8');
}
