import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function POST(req: NextRequest) {
    try {
        const { ong } = await req.json();
        if (!ong) {
            return NextResponse.json({ success: false, error: 'ONG no especificada' }, { status: 400 });
        }

        const contract = await connectFabric('ONGContract');
        const result = await contract.evaluateTransaction('listPendingDonations', ong);

        const decoded = decodeByteString(result.toString());
        const parsed = JSON.parse(decoded);

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