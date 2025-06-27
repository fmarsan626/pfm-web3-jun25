import { NextRequest, NextResponse } from 'next/server';
import { connectFabric } from '@/lib/hlf';

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { projectId } = await req.json();
    const contract = await connectFabric('ONGContract');
    await contract.submitTransaction('assignDonationToProject', params.id, projectId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error asignando donación a proyecto:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
