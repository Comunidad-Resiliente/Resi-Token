import {ethers, deployments, getNamedAccounts} from 'hardhat'

export const resiFixture = deployments.createFixture(async () => {
  await deployments.fixture(['v1.0.0'])

  const {deployer} = await getNamedAccounts()

  const ResiTokenContract = await ethers.getContract('ResiToken', deployer)
  const ResiRegistryContract = await await ethers.getContract('ResiRegistry', deployer)
  const ResiSBTContract = await ethers.getContract('ResiSBT', deployer)

  return {
    ResiTokenContract,
    ResiRegistryContract,
    ResiSBTContract
  }
})
