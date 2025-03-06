// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Ce module utilise Hardhat Ignition pour gérer le déploiement du smart contrat Hetic.
const ModuloCoinModule = buildModule("ModuloCoinModule", (m) => {
  // Déploiement du smart contrat Hetic
  const ModuloCoin = m.contract("ModuloCoin");

  return { ModuloCoin };
});

export default ModuloCoinModule;
