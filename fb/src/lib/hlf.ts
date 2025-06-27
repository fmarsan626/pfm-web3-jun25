import { connect, Contract, signers } from '@hyperledger/fabric-gateway';
import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import * as crypto from 'crypto';
import path from 'path';

const projectRoot = path.resolve(__dirname, '../../../../../');

export async function connectFabric(contractName: string): Promise<Contract> {
  const ccpPath = path.resolve(projectRoot, 'fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
  const cryptoPath = path.resolve(projectRoot, 'fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp');
  const tlsCertPath = path.resolve(projectRoot, 'fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt');

  const certPath = path.join(cryptoPath, 'signcerts', 'User1@org1.example.com-cert.pem');
  const keyDirectory = path.join(cryptoPath, 'keystore');
  const keyPath = path.join(keyDirectory, fs.readdirSync(keyDirectory)[0]);

  const cert = fs.readFileSync(certPath);
  const key = fs.readFileSync(keyPath);
  const tlsCert = fs.readFileSync(tlsCertPath);

  const client = new grpc.Client('localhost:7051', grpc.credentials.createSsl(tlsCert));

  const identity = {
    mspId: 'Org1MSP',
    credentials: cert,
  };

  const privateKey = crypto.createPrivateKey(key);
  const signer = signers.newPrivateKeySigner(privateKey);

  const gateway = connect({
    client,
    identity,
    signer,
  });

  const network = (await gateway).getNetwork('mychannel');
  const contract = network.getContract('basicts', contractName);

  return contract;
}
