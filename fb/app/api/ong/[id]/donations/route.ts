import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../../src/lib/hlf';
import { validateRole } from '../../../../../src/lib/auth/validationRole';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const wallet = context.params.id.toLowerCase();

  // Validar rol
  const { valid } = await validateRole(wallet, 'ong');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }

  try {
    // Obtener lista de entidades para buscar el id por wallet
    const adminContract = await connectFabric('AdminContract');
    const entitiesRaw = await adminContract.evaluateTransaction('listAllEntities');
    const entitiesText = Buffer.from(entitiesRaw.toString().split(',').map(b => parseInt(b.trim()))).toString('utf-8');
    const entities = JSON.parse(entitiesText);

    const matching = entities.find((e: any) => e.wallet?.toLowerCase() === wallet);
    if (!matching) {
      return NextResponse.json({ success: false, error: 'ONG no encontrada para esta wallet' }, { status: 404 });
    }

    const ongId = matching.id;

    const contract = await connectFabric('ONGContract');
    const result = await contract.evaluateTransaction('listAllDonationsByONG', ongId);

    const decoded = Buffer.from(result.toString().split(',').map(b => parseInt(b.trim()))).toString('utf-8');
    const parsed = JSON.parse(decoded);

    return NextResponse.json({ success: true, result: parsed });
  } catch (err: any) {
    console.error('❌ Error al listar donaciones de ONG:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
