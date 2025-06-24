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
exports.ProjectContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const constants_1 = require("./constants");
let ProjectContract = class ProjectContract extends fabric_contract_api_1.Contract {
    async confirmReceipt(ctx, donationId) {
        const msp = ctx.clientIdentity.getMSPID();
        if (msp !== 'Org2MSP') {
            throw new Error('Solo proyectos bajo Org2 pueden confirmar recepción de donaciones');
        }
        const donationBytes = await ctx.stub.getState(donationId);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`La donación ${donationId} no existe`);
        }
        const donation = JSON.parse(donationBytes.toString());
        if (donation.status !== constants_1.DonationStatus.ASIGNADA_A_PROYECTO) {
            throw new Error(`La donación ${donationId} no está en estado asignado a proyecto`);
        }
        donation.status = constants_1.DonationStatus.RECIBIDA_POR_PROYECTO;
        donation.timestamp = new Date().toISOString();
        await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
    }
    async reportExecution(ctx, donationId, executionReport) {
        const msp = ctx.clientIdentity.getMSPID();
        if (msp !== 'Org2MSP') {
            throw new Error('Solo proyectos bajo Org2 pueden registrar la ejecución');
        }
        const donationBytes = await ctx.stub.getState(donationId);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`La donación ${donationId} no existe`);
        }
        const donation = JSON.parse(donationBytes.toString());
        if (donation.status !== constants_1.DonationStatus.RECIBIDA_POR_PROYECTO) {
            throw new Error(`La donación ${donationId} no ha sido confirmada como recibida aún`);
        }
        donation.status = constants_1.DonationStatus.EJECUTADA_EN_PROYECTO;
        donation.executionReport = executionReport;
        donation.timestamp = new Date().toISOString();
        await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
    }
    async listProjectDonations(ctx, projectId) {
        const results = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const donation = JSON.parse(res.value.value.toString());
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
};
exports.ProjectContract = ProjectContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], ProjectContract.prototype, "confirmReceipt", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], ProjectContract.prototype, "reportExecution", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], ProjectContract.prototype, "listProjectDonations", null);
exports.ProjectContract = ProjectContract = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'ProjectContract', description: 'Contrato para la gestión de proyectos que reciben donaciones' })
], ProjectContract);
