//import {deployments} from 'hardhat'
const deployments = require('hardhat')

export const resiFixture = deployments.createFixture(async ({deployments, getNamedAccounts, ethers}) => {
  await deployments.fixture(['v1.0.0'])

  const {deployer} = await getNamedAccounts()

  const ResiTokenContract = await ethers.getContract('ResiToken', deployer)
  const ResiRegistryContract = await await ethers.getContract('ResiRegistry', deployer)
  const ResiSBTContract = await ethers.getContract('ResiSBT', deployer)

  return {
    deployer,
    ResiTokenContract,
    ResiRegistryContract,
    ResiSBTContract
  }
})
