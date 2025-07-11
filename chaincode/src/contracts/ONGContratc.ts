import { Context, Contract, Info, Transaction, Returns } from 'fabric-contract-api';
import { DONATION_STATUS } from './constants';
import { Donation } from './models/Donation';


@Info({ title: 'ONGContract', description: 'Contrato para la gestión de donaciones por parte de una ONG' })
export class ONGContract extends Contract {
  @Transaction()
  public async acceptDonation(ctx: Context, donationId: string): Promise<void> {
    const msp = ctx.clientIdentity.getMSPID();
    if (msp !== 'Org1MSP') throw new Error('Solo la ONG (Org1) puede aceptar donaciones');

    const donationBytes = await ctx.stub.getState(donationId);
    if (!donationBytes || donationBytes.length === 0) throw new Error('Donación no encontrada');

    const donation = JSON.parse(donationBytes.toString()) as Donation;
    if (donation.status !== DONATION_STATUS.ENVIADA_A_ONG) throw new Error('Donación no disponible para aceptación');

    donation.status = DONATION_STATUS.ACEPTADA_POR_ONG;
    donation.handledBy = ctx.clientIdentity.getID();
    donation.timestamp = new Date().toISOString();
    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction()
  public async rejectDonation(ctx: Context, donationId: string): Promise<void> {
    const msp = ctx.clientIdentity.getMSPID();
    if (msp !== 'Org1MSP') throw new Error('Solo la ONG (Org1) puede rechazar donaciones');

    const donationBytes = await ctx.stub.getState(donationId);
    if (!donationBytes || donationBytes.length === 0) throw new Error('Donación no encontrada');

    const donation = JSON.parse(donationBytes.toString()) as Donation;
    if (donation.status !== DONATION_STATUS.ENVIADA_A_ONG) throw new Error('Donación no disponible para rechazo');

    donation.status = DONATION_STATUS.RECHAZADA_POR_ONG;
    donation.handledBy = ctx.clientIdentity.getID();
    donation.timestamp = new Date().toISOString();
    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction()
  public async assignDonationToProject(ctx: Context, donationId: string, projectId: string): Promise<void> {
    const msp = ctx.clientIdentity.getMSPID();
    if (msp !== 'Org1MSP') throw new Error('Solo la ONG (Org1) puede asignar proyectos');

    const donationBytes = await ctx.stub.getState(donationId);
    if (!donationBytes || donationBytes.length === 0) throw new Error('Donación no encontrada');

    const donation = JSON.parse(donationBytes.toString()) as Donation;
    if (donation.status !== DONATION_STATUS.ACEPTADA_POR_ONG) throw new Error('La donación no puede ser asignada');

    donation.status = DONATION_STATUS.ASIGNADA_A_PROYECTO;
    donation.assignedProjectId = projectId;
    donation.timestamp = new Date().toISOString();
    await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
  }

  @Transaction(false)
  @Returns('string')
  public async listPendingDonations(ctx: Context, ongId: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('', '');
    const results = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        try {
          const donation = JSON.parse(res.value.value.toString());

          if (
            donation.status === DONATION_STATUS.ENVIADA_A_ONG &&
            donation.ongId?.toLowerCase() === ongId.toLowerCase()
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

  @Transaction(false)
  @Returns('string')
  public async listUnassignedDonations(ctx: Context, ongId: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('', '');
    const results = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        try {
          const donation = JSON.parse(res.value.value.toString());

          if (
            donation.status === DONATION_STATUS.ACEPTADA_POR_ONG &&
            donation.ongId?.toLowerCase() === ongId.toLowerCase() &&
            !donation.assignedProjectId
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

  @Transaction(false)
  @Returns('string')
  public async listAllDonationsByONG(ctx: Context, ongId: string): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('', '');
    const results = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        try {
          const donation = JSON.parse(res.value.value.toString());

          if (donation.ongId?.toLowerCase() === ongId.toLowerCase()) {
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


