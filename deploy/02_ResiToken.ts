import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import {printDeploySuccessful, printInfo} from '../utils'
import {ethers} from 'hardhat'

const version = 'v1.0.0'
const ContractName = 'ResiToken'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, network} = hre
  const {deploy} = deployments
  const {deployer, treasury} = await getNamedAccounts()

  const ResiRegistry = await deployments.get('ResiRegistry')

  printInfo(`\n Deploying ${ContractName} contract on ${network.name}...`)

  const ResiTokenResult = await deploy(ContractName, {
    args: [],
    contract: ContractName,
    from: deployer,
    proxy: {
      proxyContract: 'OptimizedTransparentProxy',
      viaAdminContract: 'ResiProxyAdmin',
      execute: {
        init: {
          methodName: 'initialize',
          args: [treasury, ResiRegistry.address]
        }
      }
    },
    skipIfAlreadyDeployed: false
  })

  const resiTokenAddress = ResiTokenResult.address

  printDeploySuccessful(ContractName, resiTokenAddress)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, version]
func.dependencies = ['ResiRegistry' + version, 'ResiProxyAdmin']
func.id = id
