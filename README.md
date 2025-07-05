# Plataforma de Donaciones sobre Hyperledger Fabric

Este proyecto es una plataforma descentralizada para gestionar donaciones entre donantes, ONGs, proyectos y beneficiarios utilizando **Hyperledger Fabric** como infraestructura blockchain.  

## 🧱 Requisitos previos

- Docker & Docker Compose
- Node.js v18+
- Yarn o npm
- Git
- [fabric-samples](https://github.com/hyperledger/fabric-samples) clonado en la raíz del proyecto.

## 🚀 Inicialización del entorno

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/fmarsan626/pfm-web3-jun25.git
   cd pfm-web3-jun25
   ```

2. **Clona `fabric-samples` en la raíz:**

   ```bash
   git clone https://github.com/hyperledger/fabric-samples.git
   ```

3. **Arranca la red de Fabric y el entorno completo:**

   ```bash
   ./inicio.sh
   ```

   Este script:
   - Inicia la red con los contratos.
   - Instala las dependencias de la interfaz web.
   - Conecta Fabric a la app vía HLF SDK.

4. **Ejecuta la interfaz frontend (Next.js):**

   ```bash
   cd fb
   npm install
   npm run dev
   ```

   Accede a la app en [http://localhost:3000](http://localhost:3000)

---

## 🧭 Flujo de trabajo

El flujo completo de la aplicación consiste en varios roles: **Admin, Donante, ONG, Proyecto y Beneficiario**.

### 1. 👩‍⚖️ Admin: Crear entidades

El administrador accede a la sección `/admin` y crea las siguientes entidades:


- **ONGs** (type: `ong`)
- **Proyectos** (type: `project`)
- **Beneficiarios** (type: `beneficiary`)

Cada entidad tiene un `id`, `name`, `wallet` (dirección Ethereum) y `type`.

---

### 2. 🤝 Donante: Realiza una donación

1. Entra en la app usando cualquier wallet no registrada.
2. Rellena los campos para:
   - Cantidad
   - ONG destino
   - Metadatos (descripción de la donación)

   Esto crea un nuevo objeto `Donation` con estado inicial: `Enviada a ONG`.

---

### 3. 🏢 ONG: Recibe donaciones

1. El usuario con rol ONG accede a su panel, para esto necesita que el admin haya registrado su wallet.
2. Verá las donaciones recibidas.
3. Puede confirmar recepción, lo que cambia el estado a `Aceptada por ONG` o puede rechazarla.
4. Las donaciones aceptadas se pueden asignar a un proyecto, cambiado su estado a `Asignada a proyecto`


---

### 4. 🏗️ Proyecto: Asigna donación a un beneficiario

1. El usuario del proyecto accede a su panel si tiene un wallet registrado por el admin.
2. Visualiza donaciones con estado `Asignada a proyecto`.
3. Asigna una donación a un beneficiario (cambiando el estado a `Asignada a beneficiario`).

---

### 5. 👤 Beneficiario: Confirma recepción

1. El beneficiario accede y ve las donaciones asignadas (`Asignada a beneficiario`).
2. Al confirmar entrega, añade un **informe**.
3. Estado cambia a `Entregada a beneficiario`.

---

### 6. 🏗️ Proyecto: Reporta ejecución

1. El proyecto ahora puede ver donaciones con estado `Entregada a beneficiario`.
2. Envía un informe de ejecución (`executionReport`).
3. Esto marca la donación como **completamente reportada**. El estado cambia a `Ejecutada`


---

## 📂 Estructura del Proyecto

```
.
├── fabric-samples/           # Clonado desde Hyperledger
├── fb/                       # Interfaz Next.js + Web3
│   ├── app/
│   ├── src/
│   │   ├── context/          # Web3Context para la wallet
│   │   ├── lib/              # SDK Fabric, validaciones
│   │   └── ...               # Páginas y API routes
├── chaincode/                # Smart Contracts
│   ├── AdminContract.ts
│   ├── DonorContract.ts
│   ├── ONGContract.ts
│   ├── ProjectContract.ts
│   ├── BeneficiaryContract.ts
│   └── models/
├── inicio.sh                 # Script de arranque completo
└── README.md
```

---

## 🛠️ Funcionalidades técnicas destacadas

- 🧩 Modularización por rol (Admin, Donor, ONG, Project, Beneficiary).
- 🔐 Validación de roles usando `validateRole()`. Esto evita que se pueda acceder directamente a los endpoints
- 📡 Interacción con Fabric vía `connectFabric()` y `submitTransaction()` / `evaluateTransaction()`.
- 🔄 Decodificación de strings binarios (`decodeByteString`) desde Fabric.
- 📅 Fechas mostradas en formato legible.
- ✅ Flujo de donación completo, trazable y auditable.

---


## 📫 Contacto

Para dudas o contribuciones, contacta conmigo directamente o abre un issue en el repositorio.
