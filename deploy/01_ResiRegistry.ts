import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import {printDeploySuccessful, printInfo} from '../utils'
import {ethers} from 'hardhat'

const version = 'v1.0.0'
const ContractName = 'ResiRegistry'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, network} = hre
  const {deploy} = deployments
  const {deployer} = await getNamedAccounts()

  printInfo(`\n Deploying ${ContractName} contract on ${network.name}...`)

  const RegistryResult = await deploy(ContractName, {
    args: [],
    contract: ContractName,
    from: deployer,
    proxy: {
      proxyContract: 'OptimizedTransparentProxy',
      viaAdminContract: 'ResiProxyAdmin',
      execute: {
        init: {
          methodName: 'initialize',
          args: []
        }
      }
    },
    skipIfAlreadyDeployed: false
  })

  const resiRegistryAddress = RegistryResult.address

  printDeploySuccessful(ContractName, resiRegistryAddress)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, version]
func.dependencies = ['ResiProxyAdmin']
func.id = id
