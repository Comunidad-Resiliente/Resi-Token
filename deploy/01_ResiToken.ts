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
    skipIfAlreadyDeployed: false
  })

  const resiTokenAddress = ResiTokenResult.address
  const ResiTokenContract = await ethers.getContract(ContractName)

  if (ResiTokenResult.newlyDeployed) {
    await ResiTokenContract.initialize(treasury, ResiRegistry.address)
  }

  printDeploySuccessful(ContractName, resiTokenAddress)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, version]
func.dependencies = ['ResiRegistry' + version]
func.id = id
