import express from 'express';
import { connectFabric } from '../hlf.js';

const router = express.Router();

let contract;
const initContract = async () => {
  if (!contract) contract = await connectFabric("ProjectContract");
};

router.post('/donations/:id/confirm', async (req, res) => {
  await initContract();
  try {
    await contract.submitTransaction("confirmReceipt", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/donations/:id/report', async (req, res) => {
  await initContract();
  const { executionReport } = req.body;
  try {
    await contract.submitTransaction("reportExecution", req.params.id, executionReport);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/donations', async (req, res) => {
  await initContract();
  try {
    const result = await contract.evaluateTransaction("listProjectDonations");
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;