import express from 'express';
import { connectFabric } from '../hlf.js';

const router = express.Router();

let contract;
const initContract = async () => {
  if (!contract) contract = await connectFabric("ONGContract");
};

router.post('/donations/:id/accept', async (req, res) => {
  await initContract();
  try {
    await contract.submitTransaction("acceptDonation", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/donations/:id/reject', async (req, res) => {
  await initContract();
  try {
    await contract.submitTransaction("rejectDonation", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/donations/:id/assign', async (req, res) => {
  await initContract();
  const { projectId } = req.body;
  try {
    await contract.submitTransaction("assignDonationToProject", req.params.id, projectId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/donations/pending', async (req, res) => {
  await initContract();
  try {
    const result = await contract.evaluateTransaction("listPendingDonations");
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;