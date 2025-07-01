import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { DONATION_STATUS } from './constants';
import { Donation } from './models/Donation';

@Info({ title: 'BeneficiaryContract', description: 'Contrato para beneficiarios que confirman entregas' })
export class BeneficiaryContract extends Contract {

  @Transaction()
  public async confirmDelivery(ctx: Context, donationId: string, beneficiaryId: string, deliveryReport: string): Promise<void> {
    this._checkMSP(ctx, 'Org1MSP');

    const donation = await this._getDonation(ctx, donationId);

    if (donation.status !== DONATION_STATUS.ASIGNADA_A_BENEFICIARIO) {
      throw new Error(`La donación ${donationId} no ha sido marcada como ENTREGADA.`);
    }

    if (donation.beneficiaryId !== beneficiaryId) {
      throw new Error(`La donación ${donationId} no está asignada al beneficiario ${beneficiaryId}.`);
    }
    donation.status = DONATION_STATUS.ENTREGADA_A_BENEFICIARIO;
    donation.deliveryReport = deliveryReport;

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction(false)
  @Returns('string')
  public async listReceivedDonations(ctx: Context, beneficiaryId: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('', '');
    const results: Donation[] = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        try {
          const donation: Donation = JSON.parse(res.value.value.toString());
          if (donation.beneficiaryId === beneficiaryId) {
            results.push(donation);
          }
        } catch (e) {
          console.error(`Error al parsear: ${e}`);
        }
      }
      if (res.done) break;
    }
    await iterator.close();

    return JSON.stringify(results);
  }


  private async _getDonation(ctx: Context, donationId: string): Promise<Donation> {
    const data = await ctx.stub.getState(donationId);
    if (!data || data.length === 0) {
      throw new Error(`La donación ${donationId} no existe.`);
    }
    return JSON.parse(data.toString());
  }

  private _checkMSP(ctx: Context, expectedMSP: string) {
    const mspId = ctx.clientIdentity.getMSPID();
    if (mspId !== expectedMSP) {
      throw new Error(`Acceso denegado para MSP: ${mspId}`);
    }
  }
}

export default BeneficiaryContract;
