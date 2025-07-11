import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { DONATION_STATUS } from './constants';
import { Donation } from './models/Donation';

@Info({ title: 'ProjectContract', description: 'Contrato para proyectos que reciben y reportan donaciones' })
export class ProjectContract extends Contract {

  @Transaction()
  public async confirmReceipt(ctx: Context, donationId: string): Promise<void> {
    this._checkMSP(ctx, 'Org1MSP');

    const donation = await this._getDonation(ctx, donationId);

    if (donation.status !== DONATION_STATUS.ASIGNADA_A_PROYECTO) {
      throw new Error(`La donación ${donationId} debe estar en estado ASIGNADA.`);
    }

    donation.status = DONATION_STATUS.RECIBIDA_POR_PROYECTO;

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction()
  public async reportExecution(ctx: Context, donationId: string, executionReport: string): Promise<void> {
    this._checkMSP(ctx, 'Org1MSP');

    const donation = await this._getDonation(ctx, donationId);

    if (donation.status !== DONATION_STATUS.ENTREGADA_A_BENEFICIARIO) {
      throw new Error(`La donación ${donationId} debe estar en estado ENTREGADA.`);
    }
    donation.status = DONATION_STATUS.EJECUTADA_EN_PROYECTO;
    donation.executionReport = executionReport;

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction()
  public async assignDonationToBeneficiary(ctx: Context, donationId: string, beneficiaryId: string): Promise<void> {
    this._checkMSP(ctx, 'Org1MSP');

    const donation = await this._getDonation(ctx, donationId);

    if (donation.status !== DONATION_STATUS.RECIBIDA_POR_PROYECTO) {
      throw new Error(`La donación ${donationId} debe estar en estado RECIBIDA para ser entregada a un beneficiario.`);
    }
    donation.status = DONATION_STATUS.ASIGNADA_A_BENEFICIARIO;
    donation.beneficiaryId = beneficiaryId;
    // No cambiamos status aquí: confirmación ocurre en BeneficiaryContract

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction(false)
  @Returns('string')
  public async listProjectDonations(ctx: Context): Promise<string> {
    const iterator: any = await ctx.stub.getStateByRange('', '');
    const results: Donation[] = [];


    while (true) {
      const res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        const donation: Donation = JSON.parse(res.value.value.toString());
        if (donation.assignedProjectId) {
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

export default ProjectContract;
