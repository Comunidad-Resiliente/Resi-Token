import {HardhatRuntimeEnvironment} from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import {printDeploySuccessful, printInfo} from '../utils'
import {ethers} from 'hardhat'

const ContractName = 'MockERC20'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, network, getChainId} = hre
  const {deploy} = deployments
  const {deployer} = await getNamedAccounts()

  if (!network.tags.testnet) {
    return
  }

  printInfo(`\n Deploying ${ContractName} contract on ${network.name}...`)

  const chainId = await getChainId()

  const ResiMockToken = await deploy(ContractName, {
    args: ['ResiMockToken', 'RESIMTOKEN', ethers.utils.parseEther('10000000000')],
    contract: ContractName,
    from: deployer,
    skipIfAlreadyDeployed: false
  })

  const resiMockTokenAddress = ResiMockToken.address
  printDeploySuccessful(ContractName, resiMockTokenAddress)

  return true
}

export default func
const id = ContractName
func.tags = [id]
func.id = id
