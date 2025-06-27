export interface Donation {
  donationId: string;
  ongId: string;
  metadata: string;
  createdBy: string;
  status: string;
  timestamp: string;
  assignedProjectId?: string;
  handledBy?: string;
  executionReport?: string;
  beneficiaryId?: string;
  deliveryReport?: string;
}