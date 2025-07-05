import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { DONATION_STATUS } from './constants';
import { Donation } from './models/Donation';

@Info({ title: 'DonorContract', description: 'Contrato de donaciones de donantes' })
export class DonorContract extends Contract {
  @Transaction()
  @Returns('string')
  public async registerDonation(ctx: Context, donationId: string, amount: string, metadata: string, ongId: string, donor: string): Promise<string> {
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
      amount,
      metadata,
      ongId,
      donor,
      createdBy: ctx.clientIdentity.getID(),
      status: DONATION_STATUS.ENVIADA_A_ONG,
      timestamp: new Date().toISOString()
    };

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
    return JSON.stringify(donation);
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
  public async listMyDonations(ctx: Context, donor: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('', '');
    const results = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        try {
          const donation = JSON.parse(res.value.value.toString());

          if (
           
            donation.donor?.toLowerCase() === donor.toLowerCase()
          ) {
            results.push(donation);
          }
        } catch (e) {
          console.error(`Error al parsear donación: ${e}`);
        }
      }
      if (res.done) break;
    }

    await iterator.close();
    return JSON.stringify(results);
  }
}
