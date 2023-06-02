import {ethers, deployments, getNamedAccounts} from 'hardhat'
import {
  MockERC20__factory,
  ResiRegistry,
  ResiRegistry__factory,
  ResiSBT,
  ResiSBT__factory,
  ResiToken,
  ResiToken__factory,
  ResiVault,
  ResiVault__factory
} from '../typechain-types'

export const resiMainFixture = deployments.createFixture(async () => {
  await deployments.fixture(['v1.0.0'])

  const {deployer} = await getNamedAccounts()

  const ResiRegistryContract: ResiRegistry = await ethers.getContract<ResiRegistry>('ResiRegistry', deployer)
  const ResiVaultContract: ResiVault = await ethers.getContract<ResiVault>('ResiVault', deployer)
  const ResiTokenContract: ResiToken = await ethers.getContract<ResiToken>('ResiToken', deployer)
  const ResiSBTContract: ResiSBT = await ethers.getContract<ResiSBT>('ResiSBT', deployer)

  return {
    ResiRegistryContract,
    ResiSBTContract,
    ResiTokenContract,
    ResiVaultContract
  }
})

export const resiManualFixture = deployments.createFixture(async () => {
  const {deployer, treasury} = await getNamedAccounts()

  const ResiRegistryFactory: ResiRegistry__factory = await ethers.getContractFactory<ResiRegistry__factory>(
    'ResiRegistry'
  )
  const ResiVaultFactory: ResiVault__factory = await ethers.getContractFactory<ResiVault__factory>('ResiVault')
  const ResiTokenFactory: ResiToken__factory = await ethers.getContractFactory<ResiToken__factory>('ResiToken')
  const ResiSBTFactory: ResiSBT__factory = await ethers.getContractFactory<ResiSBT__factory>('ResiSBT')
  const MockERC20Factory: MockERC20__factory = await ethers.getContractFactory<MockERC20__factory>('MockERC20')

  const ResiRegistry: ResiRegistry = await ResiRegistryFactory.deploy()
  const ResiVault: ResiVault = await ResiVaultFactory.deploy()
  const ResiToken: ResiToken = await ResiTokenFactory.deploy()
  const ResiSBT: ResiSBT = await ResiSBTFactory.deploy()
  const MockERC20Token = await MockERC20Factory.deploy('MOCKERC20', 'MERC20', '1000000000000000000000000')
  await MockERC20Token.deployed()

  await ResiRegistry.deployed()
  await ResiVault.deployed()
  await ResiToken.deployed()
  await ResiSBT.deployed()

  //INITIALIZATIONS

  await ResiRegistry.initialize()
  await ResiToken.initialize(treasury, ResiRegistry.address)
  await ResiVault.initialize('1', ResiToken.address, MockERC20Token.address, ResiRegistry.address)
  await ResiSBT.initialize('RESI SBT', 'RSBT', 'https://ipfs', '1', ResiRegistry.address, ResiToken.address)

  return {
    ResiRegistryContract: ResiRegistry,
    ResiTokenContract: ResiToken,
    ResiVaultContract: ResiVault,
    ResiSBTContract: ResiSBT,
    MockERC20TokenContract: MockERC20Token
  }
})

export const getResiFullTestEnvironment = deployments.createFixture(async () => {})
