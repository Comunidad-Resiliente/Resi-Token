const networks: any = {
  localhost: {
    chainId: 31337,
    url: 'http://127.0.0.1:8545',
    allowUnlimitedContractSize: true,
    timeout: 1000 * 60,
    saveDeployments: true
  },
  hardhat: {
    live: false,
    allowUnlimitedContractSize: true,
    saveDeployments: true,
    tags: ['test', 'local']
  },
  polygon: {
    url: process.env.ALCHEMY_KEY
      ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
      : 'https://speedy-nodes-nyc.moralis.io/237feb2eade8c576d06ac0ae/polygon/mainnet',
    chainId: 137,
    accounts: {mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : ''}
  },
  mumbai: {
    live: true,
    chainId: 80001,
    url: process.env.ALCHMEMY_KEY
      ? `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
      : 'https://rpc-mumbai.maticvigil.com',
    accounts: {
      mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : ''
    },
    allowUnlimitedContractSize: false,
    timeout: 1000 * 60,
    tags: ['testnet']
  },
  lachain: {
    live: true,
    url: 'https://rpc1.mainnet.lachain.network',
    chainId: 274,
    accounts: {
      mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : ''
    },
    allowUnlimitedContractSize: false,
    timeout: 1000 * 60,
    tags: ['mainnet']
  },
  latestnet: {
    live: true,
    chainId: 418,
    url: 'https://rpc.testnet.lachain.network',
    accounts: {
      mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : ''
    },
    allowUnlimitedContractSize: false,
    timeout: 1000 * 60,
    tags: ['testnet']
  }
}

export default networks

/**
Network Name
LaChain
RPC URL
https://rpc1.mainnet.lachain.network
Chain Id
274
Currency Symbol
‍LAC
Block Explorer URL
‍https://explorer.lachain.network/

Network Name
LaTestnet
RPC URL
https://rpc.testnet.lachain.network
Chain Id
418
Currency Symbol
‍TLA
Block Explorer URL
‍https://testexplorer.lachain.network
 */
