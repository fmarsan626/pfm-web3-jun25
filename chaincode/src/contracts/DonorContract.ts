import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { DonationStatus } from './constants';
import { Donation } from './models/Donation';

@Info({ title: 'DonorContract', description: 'Contrato de donaciones de donantes' })
export class DonorContract extends Contract {
  @Transaction()
  public async registerDonation(ctx: Context, donationId: string, metadata: string): Promise<void> {
    const msp = ctx.clientIdentity.getMSPID();
    if (msp !== 'Org1MSP') {
      throw new Error('Solo los donantes (Org1) pueden registrar donaciones');
    }

    const exists = await ctx.stub.getState(donationId);
    if (exists && exists.length > 0) {
      throw new Error(`La donación ${donationId} ya existe`);
    }

    const donation: Donation = {
      donationId,
      metadata,
      createdBy: ctx.clientIdentity.getID(),
      status: DonationStatus.ENVIADA_A_ONG,
      timestamp: new Date().toISOString()
    };

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction(false)
  @Returns('string')
  public async getDonation(ctx: Context, donationId: string): Promise<string> {
    const donationBytes = await ctx.stub.getState(donationId);
    if (!donationBytes || donationBytes.length === 0) {
      throw new Error(`La donación ${donationId} no existe`);
    }
    return donationBytes.toString();
  }

  @Transaction(false)
  @Returns('string')
  public async listMyDonations(ctx: Context): Promise<string> {
    const allResults: Donation[] = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    const clientId = ctx.clientIdentity.getID();

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        const record = JSON.parse(res.value.value.toString()) as Donation;
        if (record.createdBy === clientId) {
          allResults.push(record);
        }
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(allResults);
  }
}
