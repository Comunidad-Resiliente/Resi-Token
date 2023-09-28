import {ethers} from 'hardhat'
import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import {printDeploySuccessful, printInfo} from '../utils'
import {SBTConfig} from '../config'

const version = 'v1.0.0'
const ContractName = 'ResiSBT'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, getChainId, network} = hre
  const {deploy} = deployments

  const {deployer} = await getNamedAccounts()

  printInfo(`\n Deploying ${ContractName} contract... on ${network.name}`)

  const ResiRegistry = await deployments.get('ResiRegistry')
  const ResiToken = await deployments.get('ResiToken')

  const chainId = await getChainId()

  const sbtName = `ResiSBT-${SBTConfig[chainId].SERIE_ID}`
  const sbtSymbol = `RSBT-${SBTConfig[chainId].SERIE_ID}`
  if (!sbtName || !sbtSymbol) {
    throw Error('Please provide a valid SBT Role to deploy')
  }
  const contractURI = SBTConfig[chainId].CONTRACT_URI
  const serieID = SBTConfig[chainId].SERIE_ID

  const ResiSBTResult = await deploy(ContractName, {
    args: [],
    contract: ContractName,
    from: deployer,
    proxy: {
      proxyContract: 'OptimizedTransparentProxy',
      viaAdminContract: 'ResiProxyAdmin',
      execute: {
        init: {
          methodName: 'initialize',
          args: [sbtName, sbtSymbol, contractURI, serieID, ResiRegistry.address, ResiToken.address]
        }
      }
    },
    skipIfAlreadyDeployed: false
  })

  const resiSBTAddress = ResiSBTResult.address

  printDeploySuccessful(ContractName, resiSBTAddress)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, version]
func.dependencies = ['ResiRegistry' + version, 'ResiToken' + version, 'ResiProxyAdmin']
func.id = id
