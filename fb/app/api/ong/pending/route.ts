import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

export async function GET(_: NextRequest) {
    try {
        const contract = await connectFabric('ONGContract');
        const result = await contract.evaluateTransaction('listPendingDonations');

        const raw = result.toString();
        const decoded = decodeByteString(raw);
        const parsed = JSON.parse(decoded);
        console.log('🔍 Cadena del smart contract:', raw);
    
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