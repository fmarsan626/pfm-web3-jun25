import express from 'express';
import { connectFabric } from '../hlf.js';

const router = express.Router();
let contract;

const initContract = async () => {
  if (!contract) contract = await connectFabric("AdminContract");
};

router.post('/ong', async (req, res) => {
  await initContract();
  const { ongId, name, metadata } = req.body;
  try {
    const result = await contract.submitTransaction("createONG", ongId, name, metadata);
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/project', async (req, res) => {
  await initContract();
  const { projectId, name, metadata } = req.body;
  try {
    const result = await contract.submitTransaction("createProject", projectId, name, metadata);
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/beneficiary', async (req, res) => {
  await initContract();
  const { beneficiaryId, name, metadata } = req.body;
  try {
    const result = await contract.submitTransaction("createBeneficiary", beneficiaryId, name, metadata);
    res.json(JSON.parse(result.toString()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
