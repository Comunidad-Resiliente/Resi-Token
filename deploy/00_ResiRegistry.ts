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
    skipIfAlreadyDeployed: false
  })

  const resiRegistryAddress = RegistryResult.address
  const RegistryContract = await ethers.getContract(ContractName)

  if (RegistryResult.newlyDeployed) {
    await RegistryContract.initialize()
  }

  printDeploySuccessful(ContractName, resiRegistryAddress)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, version]
func.id = id
