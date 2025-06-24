#!/bin/bash

set -e

# Definir ubicación del script de red
NETWORK_DIR="fabric-samples/test-network"
CHAINCODE_NAME="basicts"
CHAINCODE_PATH="../asset-transfer-basic/chaincode-typescript"
CHANNEL_NAME="mychannel"
ENV_FILE=".env.ccaas"

echo "==============================="
echo "🚧 Limpiando red anterior..."
echo "==============================="

if [ -d "$NETWORK_DIR" ]; then
  pushd "$NETWORK_DIR" > /dev/null
  ./network.sh down || true
  popd > /dev/null
else
  echo "❌ No se encontró el directorio $NETWORK_DIR"
  exit 1
fi

echo "🧹 Limpiando contenedores CCAAS antiguos si existen..."
docker rm -f peer0org1_basicts_ccaas 2>/dev/null || true
docker rm -f peer0org2_basicts_ccaas 2>/dev/null || true


echo "==============================="
echo "🚀 Iniciando red Fabric..."
echo "==============================="

pushd "$NETWORK_DIR" > /dev/null
./network.sh up

echo "==============================="
echo "🔗 Creando canal y desplegando chaincode..."
echo "==============================="

./network.sh up createChannel -c $CHANNEL_NAME

# Guardar salida de deployCCAAS
DEPLOY_LOG=$(mktemp)
./network.sh deployCCAAS -ccn $CHAINCODE_NAME -ccp $CHAINCODE_PATH 2>&1 | tee "$DEPLOY_LOG"

echo "==============================="
echo "📦 Extrayendo datos del chaincode desde logs..."
echo "==============================="

CHAINCODE_ID=$(grep -oP 'Chaincode code package identifier: \Kbasicts_1.0:[a-f0-9]+' "$DEPLOY_LOG" | head -n 1)
CHAINCODE_SERVER_PORT=$(grep -oP 'CHAINCODE_SERVER_ADDRESS=0.0.0.0:[0-9]+' "$DEPLOY_LOG" | head -n 1 | cut -d: -f2)
CHAINCODE_SERVER_ADDRESS="host.docker.internal:$CHAINCODE_SERVER_PORT"

if [[ -n "$CHAINCODE_ID" && -n "$CHAINCODE_SERVER_PORT" ]]; then
  cat <<EOF > .env.ccaas
export CHAINCODE_ID=$CHAINCODE_ID
export CHAINCODE_SERVER_ADDRESS=$CHAINCODE_SERVER_ADDRESS
EOF
  echo "✅ Variables extraídas:"
  cat .env.ccaas
else
  echo "❌ No se pudo extraer CHAINCODE_ID o CHAINCODE_SERVER_ADDRESS desde logs"
fi