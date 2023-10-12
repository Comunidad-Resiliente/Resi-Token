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
import {advanceTime, awardBatch, getBlockTimestamp, getMockSerie} from '../utils'
import {
  MENTOR_ROLE,
  PROJECT_BUILDER_ROLE,
  PROJECT_ONE,
  PROJECT_THREE,
  PROJECT_TWO,
  RESI_BUILDER_ROLE
} from './constants'

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
  const {ResiRegistryContract, ResiSBTContract, ResiTokenContract, ResiVaultContract} = await resiMainFixture()

  const MockERC20Factory: MockERC20__factory = await ethers.getContractFactory<MockERC20__factory>('MockERC20')

  const MockERC20Token = await MockERC20Factory.deploy('MOCKERC20', 'MERC20', '1000000000000000000000000')
  await MockERC20Token.deployed()

  //CUSTOM INITIALIZATIONS

  await ResiTokenContract.setRegistry(ResiRegistryContract.address)
  await ResiVaultContract.setMainToken(MockERC20Token.address)

  return {
    ResiRegistryContract: ResiRegistryContract,
    ResiTokenContract: ResiTokenContract,
    ResiVaultContract: ResiVaultContract,
    ResiSBTContract: ResiSBTContract,
    MockERC20TokenContract: MockERC20Token
  }
})

export const getManualEnvironemntInitialization = async () => {
  const {ResiTokenContract, ResiRegistryContract, ResiVaultContract, ResiSBTContract, MockERC20TokenContract} =
    await resiManualFixture()
  const SerieToBeCreated = await getMockSerie()

  //CREATE SERIE
  await ResiRegistryContract.createSerie(
    SerieToBeCreated.startDate,
    SerieToBeCreated.endDate,
    SerieToBeCreated.numberOfProjects,
    SerieToBeCreated.maxSupply,
    ResiVaultContract.address
  )

  //SET DEFAULT SBTs URIS
  await ResiSBTContract.setDefaultRoleUri(MENTOR_ROLE, 'https://ipfs-metor-role')
  await ResiSBTContract.setDefaultRoleUri(RESI_BUILDER_ROLE, 'https://ipfs-resi-builder-role')
  await ResiSBTContract.setDefaultRoleUri(PROJECT_BUILDER_ROLE, 'https://ipfs-project-builder-role')

  //REGISTER SERIE SBT
  await ResiRegistryContract.registerSerieSBT(ResiSBTContract.address)

  //SET RESI TOKEN
  await ResiRegistryContract.setResiToken(ResiTokenContract.address)

  //REGISTER PROJECTS
  await ResiRegistryContract.addProjects([PROJECT_ONE, PROJECT_TWO, PROJECT_THREE])

  return {
    ResiTokenContract,
    ResiRegistryContract,
    ResiVaultContract,
    ResiSBTContract,
    MockERC20TokenContract
  }
}

export const getEndingSerieEnvironmentInitialization = async () => {
  const signers = await ethers.getSigners()

  const {ResiTokenContract, ResiRegistryContract, ResiVaultContract, ResiSBTContract, MockERC20TokenContract} =
    await resiManualFixture()
  const SerieToBeCreated = await getMockSerie()

  //CREATE SERIE
  await ResiRegistryContract.createSerie(
    SerieToBeCreated.startDate,
    SerieToBeCreated.endDate,
    SerieToBeCreated.numberOfProjects,
    SerieToBeCreated.maxSupply,
    ResiVaultContract.address
  )

  //SET DEFAULT SBTs URIS
  await ResiSBTContract.setDefaultRoleUri(MENTOR_ROLE, 'https://ipfs-metor-role')
  await ResiSBTContract.setDefaultRoleUri(RESI_BUILDER_ROLE, 'https://ipfs-resi-builder-role')
  await ResiSBTContract.setDefaultRoleUri(PROJECT_BUILDER_ROLE, 'https://ipfs-project-builder-role')

  //REGISTER SERIE SBT
  await ResiRegistryContract.registerSerieSBT(ResiSBTContract.address)

  //SET RESI TOKEN
  await ResiRegistryContract.setResiToken(ResiTokenContract.address)

  //REGISTER PROJECTS
  await ResiRegistryContract.addProjects([PROJECT_ONE, PROJECT_TWO, PROJECT_THREE])

  //SET TREASURY VAULT ADDRESS
  await ResiRegistryContract.setTreasuryVault(await signers[0].getAddress())

  //ASSIGN MENTORS (ONE PER PROJECT)
  const mentors = [await signers[19].getAddress(), await signers[18].getAddress(), await signers[17].getAddress()]
  await ResiTokenContract.addRolesBatch(MENTOR_ROLE, mentors)

  //ASSIGN PROJECT BUILDERS
  const projectBuildersProjectOne = [await signers[16].getAddress(), await signers[15].getAddress()]
  const projectBuildersProjectTwo = [
    await signers[14].getAddress(),
    await signers[13].getAddress(),
    await signers[12].getAddress()
  ]
  const projectBuildersProjectThree = [
    await signers[11].getAddress(),
    await signers[10].getAddress(),
    await signers[9].getAddress()
  ]
  await ResiTokenContract.addRolesBatch(PROJECT_BUILDER_ROLE, projectBuildersProjectOne)
  await ResiTokenContract.addRolesBatch(PROJECT_BUILDER_ROLE, projectBuildersProjectTwo)
  await ResiTokenContract.addRolesBatch(PROJECT_BUILDER_ROLE, projectBuildersProjectThree)

  //ASSIGN RESI BUILDERS
  const resiBuilders = [await signers[8].getAddress(), await signers[7].getAddress()]
  await ResiTokenContract.addRolesBatch(RESI_BUILDER_ROLE, resiBuilders)

  //ADD FUNDS TO RESI VAULT
  await MockERC20TokenContract.mint()
  await MockERC20TokenContract.transfer(ResiVaultContract.address, ethers.utils.parseEther('1000'))

  //AWARD USERS
  await awardBatch(ResiTokenContract, MENTOR_ROLE, mentors, [
    ethers.utils.parseEther('20'),
    ethers.utils.parseEther('25'),
    ethers.utils.parseEther('30')
  ])
  await awardBatch(ResiTokenContract, PROJECT_BUILDER_ROLE, projectBuildersProjectOne, [
    ethers.utils.parseEther('10'),
    ethers.utils.parseEther('15')
  ])
  await awardBatch(ResiTokenContract, PROJECT_BUILDER_ROLE, projectBuildersProjectTwo, [
    ethers.utils.parseEther('12'),
    ethers.utils.parseEther('10'),
    ethers.utils.parseEther('10')
  ])
  await awardBatch(ResiTokenContract, PROJECT_BUILDER_ROLE, projectBuildersProjectThree, [
    ethers.utils.parseEther('10'),
    ethers.utils.parseEther('10'),
    ethers.utils.parseEther('10')
  ])
  await awardBatch(ResiTokenContract, RESI_BUILDER_ROLE, resiBuilders, [
    ethers.utils.parseEther('10'),
    ethers.utils.parseEther('10')
  ])

  //ADVANCE TIME TO END SERIE
  await advanceTime(6000000 * 600000 * 600000 * 600000 * 600000 * 600000)
  const activeSerie = await ResiRegistryContract.series(await ResiRegistryContract.activeSerie())

  //CLOSE SERIE TO ENSURE EXITS
  await ResiRegistryContract.closeSerie()

  return {
    ResiTokenContract,
    ResiRegistryContract,
    ResiVaultContract,
    ResiSBTContract,
    MockERC20TokenContract
  }
}
