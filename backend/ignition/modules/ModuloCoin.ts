// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Ce module utilise Hardhat Ignition pour gérer le déploiement du smart contrat ModuloCoin.
const ModuloCoinModule = buildModule("ModuloCoinModule", (m) => {
  // Déploiement du smart contrat ModuloCoin
  const ModuloCoin = m.contract("ModuloCoin");
  const ProprietyTitle = m.contract("ProprietyTitle", [ModuloCoin]);

  return { ModuloCoin, ProprietyTitle };
});

export default ModuloCoinModule;
