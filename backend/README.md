# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

Lancer tous les test
```shell
npx hardhat test
```
Lancer une blockchain local
```shell
npx hardhat node
```

Déployer un smart contract spécifique sur la blockchain locale (après avoir lancé la blockchain locale)
```shell
npx hardhat ignition deploy ./ignition/modules/Hetic.ts --network localhost
```

Compiler les smarts contracts pour avoir l’ABI
```shell
npx hardhat compile
```

Clean le projet hardhat (supprime le cache et les artifacts)
```shell
npx hardhat clean 
```
test