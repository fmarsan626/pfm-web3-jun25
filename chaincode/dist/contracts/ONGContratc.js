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
exports.ONGContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const constants_1 = require("./constants");
let ONGContract = class ONGContract extends fabric_contract_api_1.Contract {
    async acceptDonation(ctx, donationId) {
        const msp = ctx.clientIdentity.getMSPID();
        if (msp !== 'Org2MSP')
            throw new Error('Solo la ONG (Org2) puede aceptar donaciones');
        const donationBytes = await ctx.stub.getState(donationId);
        if (!donationBytes || donationBytes.length === 0)
            throw new Error('Donación no encontrada');
        const donation = JSON.parse(donationBytes.toString());
        if (donation.status !== constants_1.DonationStatus.ENVIADA_A_ONG)
            throw new Error('Donación no disponible para aceptación');
        donation.status = constants_1.DonationStatus.ACEPTADA_POR_ONG;
        donation.handledBy = ctx.clientIdentity.getID();
        donation.timestamp = new Date().toISOString();
        await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
    }
    async rejectDonation(ctx, donationId) {
        const msp = ctx.clientIdentity.getMSPID();
        if (msp !== 'Org2MSP')
            throw new Error('Solo la ONG (Org2) puede rechazar donaciones');
        const donationBytes = await ctx.stub.getState(donationId);
        if (!donationBytes || donationBytes.length === 0)
            throw new Error('Donación no encontrada');
        const donation = JSON.parse(donationBytes.toString());
        if (donation.status !== constants_1.DonationStatus.ENVIADA_A_ONG)
            throw new Error('Donación no disponible para rechazo');
        donation.status = constants_1.DonationStatus.RECHAZADA_POR_ONG;
        donation.handledBy = ctx.clientIdentity.getID();
        donation.timestamp = new Date().toISOString();
        await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
    }
    async assignDonationToProject(ctx, donationId, projectId) {
        const msp = ctx.clientIdentity.getMSPID();
        if (msp !== 'Org2MSP')
            throw new Error('Solo la ONG (Org2) puede asignar proyectos');
        const donationBytes = await ctx.stub.getState(donationId);
        if (!donationBytes || donationBytes.length === 0)
            throw new Error('Donación no encontrada');
        const donation = JSON.parse(donationBytes.toString());
        if (donation.status !== constants_1.DonationStatus.ACEPTADA_POR_ONG)
            throw new Error('La donación no puede ser asignada');
        donation.status = constants_1.DonationStatus.ASIGNADA_A_PROYECTO;
        donation.assignedProjectId = projectId;
        donation.timestamp = new Date().toISOString();
        await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
    }
    async listPendingDonations(ctx) {
        const results = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const donation = JSON.parse(res.value.value.toString());
                if (donation.status === constants_1.DonationStatus.ENVIADA_A_ONG)
                    results.push(donation);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(results);
    }
};
exports.ONGContract = ONGContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], ONGContract.prototype, "acceptDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], ONGContract.prototype, "rejectDonation", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], ONGContract.prototype, "assignDonationToProject", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], ONGContract.prototype, "listPendingDonations", null);
exports.ONGContract = ONGContract = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'ONGContract', description: 'Contrato para la gestión de donaciones por parte de una ONG' })
], ONGContract);
