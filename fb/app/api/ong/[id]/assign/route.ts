import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '../../../../../src/lib/hlf';
import { validateRole } from '../../../../../src/lib/auth/validationRole';


export async function POST(req: NextRequest, context: { params: { id: string } }) {

  try {
    const donationId = context.params.id;
    const { projectId, address } = await req.json();
    //console.log(`***** Asignando donación ${donationId} al proyecto ${projectId} por la ONG ${address}`);

    const { valid } = await validateRole(address, 'ong');
    if (!valid) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });

    if (!donationId || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos: donationId o projectId' },
        { status: 400 }
      );
    }
    //console.log(`📤 Asignando donación ${donationId} al proyecto ${projectId} por la ONG ${address}`);
    const contract = await connectFabric('ONGContract');
    await contract.submitTransaction('assignDonationToProject', donationId, projectId);

    return NextResponse.json({ success: true, donationId, projectId });
  } catch (error: any) {
    console.error('Error al asignar donación:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 
