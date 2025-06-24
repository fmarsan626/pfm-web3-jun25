import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { DonationStatus } from './constants';
import { Donation } from './models/Donation';

@Info({ title: 'BeneficiaryContract', description: 'Contrato para la entrega de donaciones a beneficiarios' })
export class BeneficiaryContract extends Contract {
  @Transaction()
  public async confirmDelivery(
    ctx: Context,
    donationId: string,
    beneficiaryId: string,
    deliveryReport: string
  ): Promise<void> {
    const msp = ctx.clientIdentity.getMSPID();
    if (msp !== 'Org2MSP') {
      throw new Error('Solo entidades bajo Org2 pueden registrar entregas a beneficiarios');
    }

    const donationBytes = await ctx.stub.getState(donationId);
    if (!donationBytes || donationBytes.length === 0) {
      throw new Error(`La donación ${donationId} no existe`);
    }

    const donation = JSON.parse(donationBytes.toString()) as Donation;
    if (donation.status !== DonationStatus.EJECUTADA_EN_PROYECTO) {
      throw new Error(`La donación ${donationId} no ha sido ejecutada en proyecto`);
    }

    donation.status = DonationStatus.ENTREGADA_A_BENEFICIARIO;
    donation.deliveredToBeneficiaryId = beneficiaryId;
    donation.deliveryReport = deliveryReport;
    donation.timestamp = new Date().toISOString();

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction(false)
  @Returns('string')
  public async listReceivedDonations(ctx: Context, beneficiaryId: string): Promise<string> {
    const results: Donation[] = [];
    const iterator = await ctx.stub.getStateByRange('', '');

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        const donation = JSON.parse(res.value.value.toString()) as Donation;
        if (donation.deliveredToBeneficiaryId === beneficiaryId) {
          results.push(donation);
        }
      }
      if (res.done) {
        await iterator.close();
        break;
      }
    }

    return JSON.stringify(results);
  }
}
