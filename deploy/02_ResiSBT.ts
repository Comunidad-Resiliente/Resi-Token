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

  const ResiSBTResult = await deploy(ContractName, {
    args: [],
    contract: ContractName,
    from: deployer,
    skipIfAlreadyDeployed: false
  })

  const sbtName = SBTConfig.NAMES[process.env.SBT_ROLE_NAME].NAME
  const sbtSymbol = SBTConfig.NAMES[process.env.SBT_ROLE_NAME].SYMBOL
  if (!sbtName || !sbtSymbol) {
    throw Error('Please provide a valid SBT Role to deploy')
  }
  const contractURI = SBTConfig[chainId].CONTRACT_URI
  const serieID = SBTConfig[chainId].SERIE_ID

  const resiSBTAddress = ResiSBTResult.address
  const ResiSBTContract = await ethers.getContract(ContractName)

  if (ResiSBTResult.newlyDeployed) {
    await ResiSBTContract.initialize(sbtName, sbtSymbol, contractURI, serieID, ResiRegistry.address, ResiToken.address)
  }

  printDeploySuccessful(ContractName, resiSBTAddress)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, version]
func.dependencies = ['ResiRegistry' + version, 'ResiToken' + version]
func.id = id
