#!/bin/bash
set -e

CHANNEL_NAME="mychannel"
CHAINCODE_NAME="basicts"
NETWORK_DIR="fabric-samples/test-network"

echo "==============================="
echo "⌛ Esperando que peer0.org1 esté disponible en localhost:7051..."
echo "==============================="

# Espera activa hasta que el peer esté disponible
until nc -z localhost 7051; do
  echo "⏳ Esperando a localhost:7051..."
  sleep 2
done

echo "✅ Peer está disponible."

echo "==============================="
echo "📝 Registrando ONGs, Proyectos y Beneficiarios..."
echo "==============================="

pushd "$NETWORK_DIR" > /dev/null

export FABRIC_CFG_PATH=$PWD

# Crea core.yaml si no existe
if [ ! -f "$PWD/core.yaml" ]; then
  echo "⚠️  Generando core.yaml..."
  cat <<EOF > core.yaml
peer:
  id: peer0.org1.example.com
  address: localhost:7051
  localMspId: Org1MSP
  mspConfigPath: organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp

logging:
  level: info

BCCSP:
  Default: SW
  SW:
    Hash: SHA2
    Security: 256
    FileKeyStore:
      KeyStore: organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore
EOF
fi
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export CORE_PEER_TLS_ENABLED=false

# Función para invocar y verificar errores
function invoke_chaincode() {
  echo "⏩ Ejecutando: $1"
  peer chaincode invoke -o localhost:7051 \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    -c "$1" \
    --peerAddresses localhost:7051 \
    --waitForEvent
}

# ONGs
invoke_chaincode '{"function":"createONG","Args":["ong1", "Cruz Roja", "{\"pais\":\"ES\"}"]}'
invoke_chaincode '{"function":"createONG","Args":["ong2", "UNICEF", "{\"pais\":\"AR\"}"]}'

# Proyectos
invoke_chaincode '{"function":"createProject","Args":["proj1", "Pozos de Agua", "{\"zona\":\"África\"}"]}'
invoke_chaincode '{"function":"createProject","Args":["proj2", "Educación Primaria", "{\"zona\":\"India\"}"]}'

# Beneficiarios
invoke_chaincode '{"function":"createBeneficiary","Args":["ben1", "Juan", "{\"pais\":\"CO\"}"]}'
invoke_chaincode '{"function":"createBeneficiary","Args":["ben2", "Amina", "{\"pais\":\"NG\"}"]}'

popd > /dev/null

echo "✅ Entidades iniciales creadas con éxito."
