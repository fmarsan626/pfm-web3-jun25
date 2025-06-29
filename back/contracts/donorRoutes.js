// contracts/donorRoutes.js
import express from 'express';
import { connectFabric } from '../hlf.js';

const router = express.Router();

let contract;
const initContract = async () => {
  if (!contract) contract = await connectFabric("DonorContract");
  
};

router.post('/donations', async (req, res) => {
  await initContract();
  const { donationId, metadata, ongId } = req.body;
  try {
    const result = await contract.submitTransaction("registerDonation", donationId, metadata, ongId);
    res.json({ success: true, result: result.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/donations/:donationId', async (req, res) => {
  await initContract();
  try {
    const result = await contract.evaluateTransaction("getDonation", req.params.donationId);
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

