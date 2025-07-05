import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../../src/lib/hlf';
import { validateRole } from '../../../../../src/lib/auth/validationRole';

export async function POST(req: NextRequest, context: { params: { id: string } }) {

  const { id: wallet } = context.params; // wallet (0x...)
  const { address } = await req.json();

  const { valid } = await validateRole(address, 'beneficiary');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
  }

  try {
    const adminContract = await connectFabric('AdminContract');
    const resultL = await adminContract.evaluateTransaction('listAllEntities');
    const decodedL = decodeByteString(resultL.toString());
    const entities = JSON.parse(decodedL);


    const beneficiary = entities.find(
      (e: any) => e.type?.toLowerCase() === 'beneficiary' && e.wallet?.toLowerCase() === wallet.toLowerCase()
    );

    if (!beneficiary) {
      return NextResponse.json({ success: true, result: [] });
    }

    const beneficiaryId = beneficiary.id;




    const contract = await connectFabric('BeneficiaryContract');
    //console.log(beneficiaryId, 'id del beneficiario');
    const result = await contract.evaluateTransaction('listReceivedDonations', beneficiaryId);
    const decoded = decodeByteString(result.toString());
    const parsed = JSON.parse(decoded);
    //console.log('🔍 Donaciones recuperadas:', parsed);

    return NextResponse.json({ success: true, result: parsed });
  } catch (err: any) {
    //console.error('❌ Error al listar donaciones:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function decodeByteString(byteString: string): string {
  const bytes = byteString
    .split(',')
    .map(b => parseInt(b.trim()))
    .filter(n => !isNaN(n));

  return Buffer.from(bytes).toString('utf-8');
}
