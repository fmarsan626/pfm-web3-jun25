export interface Donation {
  donationId: string;
  ongId: string;
  amount?:string,
  metadata: string;
  createdBy: string;
  status: string;
  timestamp: string;
  donor:string,
  assignedProjectId?: string;
  handledBy?: string;
  executionReport?: string;
  beneficiaryId?: string;
  deliveryReport?: string;
}