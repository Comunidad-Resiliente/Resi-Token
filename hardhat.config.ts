import {HardhatUserConfig} from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'

import {tasks as AdminRegistryTasks} from './tasks/adminRegistry'
import {tasks as AdminSerieTasks} from './tasks/adminSerie'
import {tasks as AddProjectTasks} from './tasks/addProject'
import {tasks as DisableProjectTask} from './tasks/disableProject'
import {tasks as CreateSerieTask} from './tasks/createSerie'

AdminRegistryTasks()
AdminSerieTasks()
AddProjectTasks()
DisableProjectTask()
CreateSerieTask()

import networks from './hardhat.networks'
import namedAccounts from './hardhat.accounts'

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  networks,
  namedAccounts,
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.MUMBAI_ETHERSCAN_API_KEY ? process.env.MUMBAI_ETHERSCAN_API_KEY : ''
    }
  },
  abiExporter: {
    path: './abis',
    runOnCompile: false,
    only: [':ResiRegistry$', ':ResiReSBT$', ':ResiToken$', ':ResiVault$']
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 30,
    enabled: process.env.REPORT_GAS ? true : false
  }
}

export default config
