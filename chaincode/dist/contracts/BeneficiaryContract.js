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
exports.BeneficiaryContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const constants_1 = require("./constants");
let BeneficiaryContract = class BeneficiaryContract extends fabric_contract_api_1.Contract {
    async confirmDelivery(ctx, donationId, beneficiaryId, deliveryReport) {
        const msp = ctx.clientIdentity.getMSPID();
        if (msp !== 'Org2MSP') {
            throw new Error('Solo entidades bajo Org2 pueden registrar entregas a beneficiarios');
        }
        const donationBytes = await ctx.stub.getState(donationId);
        if (!donationBytes || donationBytes.length === 0) {
            throw new Error(`La donación ${donationId} no existe`);
        }
        const donation = JSON.parse(donationBytes.toString());
        if (donation.status !== constants_1.DonationStatus.EJECUTADA_EN_PROYECTO) {
            throw new Error(`La donación ${donationId} no ha sido ejecutada en proyecto`);
        }
        donation.status = constants_1.DonationStatus.ENTREGADA_A_BENEFICIARIO;
        donation.deliveredToBeneficiaryId = beneficiaryId;
        donation.deliveryReport = deliveryReport;
        donation.timestamp = new Date().toISOString();
        await ctx.stub.putState(donationId, Buffer.from(JSON.stringify(donation)));
    }
    async listReceivedDonations(ctx, beneficiaryId) {
        const results = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const donation = JSON.parse(res.value.value.toString());
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
};
exports.BeneficiaryContract = BeneficiaryContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], BeneficiaryContract.prototype, "confirmDelivery", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(false),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], BeneficiaryContract.prototype, "listReceivedDonations", null);
exports.BeneficiaryContract = BeneficiaryContract = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'BeneficiaryContract', description: 'Contrato para la entrega de donaciones a beneficiarios' })
], BeneficiaryContract);
