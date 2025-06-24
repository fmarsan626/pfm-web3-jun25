"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonorContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const constants_1 = require("./constants");
let DonorContract = class DonorContract extends fabric_contract_api_1.Contract {
    async registerDonation(ctx, donationId, metadata) {
        const msp = ctx.clientIdentity.getMSPID();
        if (msp !== 'Org1MSP') {
            throw new Error('Solo los donantes (Org1) pueden registrar donaciones');
        }
        const exists = await ctx.stub.getState(donationId);
        if (exists && exists.length > 0) {
            throw new Error(`La donación ${donationId} ya existe`);
        }
        const donation = {
            donationId,
            metadata,
            createdBy: ctx.clientIdentity.getID(),
            status: constants_1.DonationStatus.ENVIADA_A_ONG,
            timestamp: new Date().toISOString()
        };
        await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
    }
    async getDonation(ctx, donationId) {
        const donationBytes = await ctx.stub.getState(donationId);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`La donación ${donationId} no existe`);
        }
        return donationBytes.toString();
    }
    async listMyDonations(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        const clientId = ctx.clientIdentity.getID();
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const record = JSON.parse(res.value.value.toString());
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
};
exports.DonorContract = DonorContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], DonorContract.prototype, "registerDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], DonorContract.prototype, "getDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], DonorContract.prototype, "listMyDonations", null);
exports.DonorContract = DonorContract = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'DonorContract', description: 'Contrato de donaciones de donantes' })
], DonorContract);
