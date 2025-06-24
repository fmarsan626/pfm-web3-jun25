const express = require('express');
import cors from 'cors';
import bodyParser from 'body-parser';
import donorRoutes from './contracts/donorRoutes.js';
import ongRoutes from './contracts/ongRoutes.js';
import projectRoutes from './contracts/projectRoutes.js';
import beneficiaryRoutes from './contracts/beneficiaryRoutes.js';


const app = express();
const port = 5555;

app.use(cors());
app.use(bodyParser.json());

app.use('/donor', donorRoutes);
app.use('/ong', ongRoutes);
app.use('/project', projectRoutes);
app.use('/beneficiary', beneficiaryRoutes);

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});

export default app;