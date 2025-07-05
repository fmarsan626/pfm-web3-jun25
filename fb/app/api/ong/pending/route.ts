import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../src/lib/hlf';
import { validateRole } from '../../../../src/lib/auth/validationRole';


export async function POST(req: NextRequest) {


    try {
        const { ong: address } = await req.json();
        console.log("🔍 Verificando rol de ONG:", address);

        const { valid } = await validateRole(address, 'ong');
        if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });

        const contract = await connectFabric('AdminContract');

        // Obtener ID real de la ONG a partir de la wallet
        const rawEntities = await contract.evaluateTransaction('listAllEntities');
        const decoded = decodeByteString(rawEntities.toString());
        const entities = JSON.parse(decoded);

        const ongEntity = entities.find((e: any) =>
            e.type?.toLowerCase() === 'ong' && e.wallet?.toLowerCase() === address.toLowerCase()
        );

        if (!ongEntity) {
            return NextResponse.json({ success: false, error: 'ONG no encontrada' }, { status: 404 });
        }

        const ongId = ongEntity.id;

        // Invocar al contrato real ahora que tenemos el ID correcto
        const ongContract = await connectFabric('ONGContract');
        const result = await ongContract.evaluateTransaction('listPendingDonations', ongId);
        const parsed = JSON.parse(decodeByteString(result.toString()));
        console.log("✅ Donaciones pendientes obtenidas:", parsed);

        return NextResponse.json({ success: true, result: parsed });
    } catch (error: any) {
        console.error('Error al listar donaciones pendientes:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
function decodeByteString(byteString: string): string {
    const bytes = byteString.split(',').map(b => parseInt(b.trim()));
    return Buffer.from(bytes).toString('utf-8');
}