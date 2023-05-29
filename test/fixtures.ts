import {ethers, deployments, getNamedAccounts} from 'hardhat'
import {ResiRegistry, ResiSBT, ResiToken, ResiVault} from '../typechain-types'

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
