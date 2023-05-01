import {ethers, deployments, getNamedAccounts} from 'hardhat'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'

export const resiFixture = deployments.createFixture(async () => {
  await deployments.fixture(['v1.0.0'])

  const {deployer} = await getNamedAccounts()

  const ResiTokenContract: ResiToken = await ethers.getContract<ResiToken>('ResiToken', deployer)
  const ResiRegistryContract: ResiRegistry = await await ethers.getContract<ResiRegistry>('ResiRegistry', deployer)
  const ResiSBTContract: ResiSBT = await ethers.getContract<ResiSBT>('ResiSBT', deployer)

  return {
    ResiTokenContract,
    ResiRegistryContract,
    ResiSBTContract
  }
})
