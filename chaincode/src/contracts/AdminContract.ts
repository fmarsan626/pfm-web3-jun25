import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { BENEFICIARY_STATUS, PROJECT_STATUS } from './constants';

@Info({ title: 'AdminContract', description: 'Smart contract para creación de ONGs, Proyectos y Beneficiarios' })
export class AdminContract extends Contract {

  @Transaction()
  @Returns('string')
  public async createONG(ctx: Context, ongId: string, name: string, metadata: string, wallet: string): Promise<string> {
    const exists = await this._exists(ctx, ongId);
    if (exists) throw new Error(`ONG ${ongId} ya existe`);

    const ong = {
      id: ongId,
      name,
      metadata,
      wallet,
      type: 'ong',
    };

    await ctx.stub.putState(ongId, Buffer.from(JSON.stringify(ong)));
    return JSON.stringify(ong);
  }

  @Transaction()
  @Returns('string')
  public async createProject(ctx: Context, projectId: string, name: string, metadata: string, wallet: string): Promise<string> {
    const exists = await this._exists(ctx, projectId);
    if (exists) throw new Error(`Proyecto ${projectId} ya existe`);

    const project = {
      id: projectId,
      name,
      metadata,
      status: PROJECT_STATUS.CREATED,
      donations: [],
      wallet,
      type: 'project',
    };

    await ctx.stub.putState(projectId, Buffer.from(JSON.stringify(project)));
    return JSON.stringify(project);
  }

  @Transaction()
  @Returns('string')
  public async createBeneficiary(ctx: Context, beneficiaryId: string, name: string, metadata: string, wallet: string): Promise<string> {
    const exists = await this._exists(ctx, beneficiaryId);
    if (exists) throw new Error(`Beneficiario ${beneficiaryId} ya existe`);

    const beneficiary = {
      id: beneficiaryId,
      name,
      metadata,
      type: 'beneficiary',
      donations: [],
      wallet,
      status: BENEFICIARY_STATUS.ACTIVE,
    };

    await ctx.stub.putState(beneficiaryId, Buffer.from(JSON.stringify(beneficiary)));
    return JSON.stringify(beneficiary);
  }

  private async _exists(ctx: Context, id: string): Promise<boolean> {
    const data = await ctx.stub.getState(id);
    return !!data && data.length > 0;
  }


  @Transaction(false)
  @Returns('string')
  public async listAllEntities(ctx: Context): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('', '');
    const results = [];

    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value.toString()) {
        try {
          const obj = JSON.parse(res.value.value.toString());
          if (obj.id && obj.type && obj.name) {
            results.push({
              id: obj.id,
              type: obj.type,
              name: obj.name,
              wallet: obj.wallet ?? null,
            });
          }
        } catch (_) {
          // ignorar errores de parsing
        }
      }

      if (res.done) break;
    }

    await iterator.close();
    return JSON.stringify(results);
  }
}