export interface Donation {
  donationId: string;
  metadata: string;
  createdBy: string;
  status: string;
  timestamp: string;
  assignedProjectId?: string;
  handledBy?: string;
  executionReport?: string;
  deliveredToBeneficiaryId?: string;
  deliveryReport?: string;
}