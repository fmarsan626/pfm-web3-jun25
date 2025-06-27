import express from 'express';
import { connectFabric } from '../hlf.js';

const router = express.Router();

let contract;
const initContract = async () => {
  if (!contract) contract = await connectFabric("BeneficiaryContract");
};

router.post('/:id/deliver', async (req, res) => {
  await initContract();
  const { beneficiaryId, deliveryReport } = req.body;
  try {
    await contract.submitTransaction("confirmDelivery", req.params.id, beneficiaryId, deliveryReport);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/donations', async (req, res) => {
  await initContract();
  try {
    const result = await contract.evaluateTransaction("listReceivedDonations");
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;