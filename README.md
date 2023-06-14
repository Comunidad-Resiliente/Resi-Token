# $RESI-TOKEN

- Resi Token de la Comunidad Resiliente.

[![GitHub tag](https://img.shields.io/github/tag/Comunidad-Resiliente/Resi-Token?include_prereleases=&sort=semver&color=blue)](https://github.com/Comunidad-Resiliente/Resi-Token/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![issues - Resi-Token](https://img.shields.io/github/issues/Comunidad-Resiliente/Resi-Token)](https://github.com/Comunidad-Resiliente/Resi-Token/issues)

---

### Contracts

- ResiRegistry.sol: Main admin of the protocol. Where Series and projects are created and handled.

- ResiVault.sol: Each Serie wiil have its own vault to securely store funds from convertible notes and pre-funded series.

- ResiToken.sol: Token which holds roles and funcitons to interact with Series.

- ResiSBT.sol: SBT per Serie holding data from each available role in Resi Token ecosystem. (See #Roles).

![ResiRegistry-one](./docs/imgs/Registry-SBT-one.png)

![ResiToken](./docs/imgs/ResiToken.png)

![ResiToken-two](./docs/imgs/ResiToken-two.png)

### Tokenomics

**Roles**:

- MENTOR:

- PROJECT BUILDER:

- RESI BUILDER:

- TREASURY:

---

#### Stack

- yarn
- Node js v18
- Typescript
- Hardhat

#### Commands

- Install:

```bash
yarn
```

- Compile contracts:

```bash
yarn compile
```

- Deploy locally:

```bash
yarn deploy
```

- Deploy to live network: For this step you would need to provide your MNEMONIC inside .envrc file

```bash
export MNEMONIC='YOUR MNEMONIC'

direnv allow .envrc
```

And then run:

```bash
yarn deploy:network <network>
```

- Run Test:

```bash
yarn test
```

- Run coverage:

```bash
yarn coverage
```

- Generate abis:

```bash
yarn abis
```

- Know the size of your contracts:

```bash
yarn size
```

### Roadmap

- [x] Development
- [x] Test coverage >= 90%
- [x] Deploy to testnet mumbai
- [] Development of associated subgraphs
- [] Front end develpment
- [] SC Auditory
- [] Mainnet deploy

### Autores

- Alejo Lovallo

  - [Github](https://github.com/AlejoLovallo)
  - [Medium](https://alejolovallo.medium.com/)
