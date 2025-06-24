"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contracts = void 0;
const DonorContract_1 = require("./contracts/DonorContract");
const ONGContratc_1 = require("./contracts/ONGContratc");
const ProjectContract_1 = require("./contracts/ProjectContract");
const BeneficiaryContract_1 = require("./contracts/BeneficiaryContract");
exports.contracts = [
    DonorContract_1.DonorContract,
    ONGContratc_1.ONGContract,
    ProjectContract_1.ProjectContract,
    BeneficiaryContract_1.BeneficiaryContract
];
