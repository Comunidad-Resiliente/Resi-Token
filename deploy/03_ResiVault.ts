import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import {printDeploySuccessful, printInfo} from '../utils'
import {ethers} from 'hardhat'
import {VaultConfig} from '../config'

const version = 'v1.0.0'
const ContractName = 'ResiVault'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, network, getChainId} = hre
  const {deploy} = deployments
  const {deployer, vaultToken} = await getNamedAccounts()

  const ResiRegistry = await deployments.get('ResiRegistry')
  const ResiToken = await deployments.get('ResiToken')

  printInfo(`\n Deploying ${ContractName} contract on ${network.name}...`)

  const chainId = await getChainId()

  const serieID = VaultConfig[chainId].SERIE_ID

  const ResiVaultResult = await deploy(ContractName, {
    args: [],
    contract: ContractName,
    from: deployer,
    skipIfAlreadyDeployed: false
  })

  const resiVaultAddress = ResiVaultResult.address
  const ResiVaultContract = await ethers.getContract(ContractName)

  if (ResiVaultResult.newlyDeployed) {
    await ResiVaultContract.initialize(serieID, ResiToken.address, vaultToken, ResiRegistry.address)
  }

  printDeploySuccessful(ContractName, resiVaultAddress)

  return true
}

export default func
const id = ContractName + version
func.tags = [id, version]
func.id = id
