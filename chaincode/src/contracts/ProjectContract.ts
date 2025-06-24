import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { DonationStatus } from './constants';
import { Donation } from './models/Donation';

@Info({ title: 'ProjectContract', description: 'Contrato para la gestión de proyectos que reciben donaciones' })
export class ProjectContract extends Contract {
  @Transaction()
  public async confirmReceipt(ctx: Context, donationId: string): Promise<void> {
    const msp = ctx.clientIdentity.getMSPID();
    if (msp !== 'Org2MSP') {
      throw new Error('Solo proyectos bajo Org2 pueden confirmar recepción de donaciones');
    }

    const donationBytes = await ctx.stub.getState(donationId);
    if (!donationBytes || donationBytes.length === 0) {
      throw new Error(`La donación ${donationId} no existe`);
    }

    const donation = JSON.parse(donationBytes.toString()) as Donation;
    if (donation.status !== DonationStatus.ASIGNADA_A_PROYECTO) {
      throw new Error(`La donación ${donationId} no está en estado asignado a proyecto`);
    }

    donation.status = DonationStatus.RECIBIDA_POR_PROYECTO;
    donation.timestamp = new Date().toISOString();

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction()
  public async reportExecution(ctx: Context, donationId: string, executionReport: string): Promise<void> {
    const msp = ctx.clientIdentity.getMSPID();
    if (msp !== 'Org2MSP') {
      throw new Error('Solo proyectos bajo Org2 pueden registrar la ejecución');
    }

    const donationBytes = await ctx.stub.getState(donationId);
    if (!donationBytes || donationBytes.length === 0) {
      throw new Error(`La donación ${donationId} no existe`);
    }

    const donation = JSON.parse(donationBytes.toString()) as Donation;
    if (donation.status !== DonationStatus.RECIBIDA_POR_PROYECTO) {
      throw new Error(`La donación ${donationId} no ha sido confirmada como recibida aún`);
    }

    donation.status = DonationStatus.EJECUTADA_EN_PROYECTO;
    donation.executionReport = executionReport;
    donation.timestamp = new Date().toISOString();

    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction(false)
  @Returns('string')
  public async listProjectDonations(ctx: Context, projectId: string): Promise<string> {
    const results: Donation[] = [];
    const iterator = await ctx.stub.getStateByRange('', '');

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        const donation = JSON.parse(res.value.value.toString()) as Donation;
        if (donation.assignedProjectId === projectId) {
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