import {ethers} from 'hardhat'
import {BigNumber, Contract} from 'ethers'
import {ISerie} from '../test/constants'
import {ResiToken} from '../typechain-types'

const ERC20Abi = ['function balanceOf(address owner) view returns (uint256)']

export const advanceBlock = () => {
  return ethers.provider.send('evm_mine', [])
}

export const getBlockTimestamp = async () => {
  const block = await ethers.provider.getBlock('latest')
  return BigNumber.from(block.timestamp)
}

export const getLatestBlock = async () => {
  const block = await ethers.provider.getBlock('latest')
  return BigNumber.from(block.number)
}

export const advanceTime = async (time: any) => {
  await ethers.provider.send('evm_increaseTime', [time])
}

export const advanceBlockTo = async (blockNumber: any) => {
  for (let i = await ethers.provider.getBlockNumber(); i < blockNumber; i++) {
    await advanceBlock()
  }
}

export const getERC20 = async (address: string): Promise<Contract> => {
  const ERC20Contract = new ethers.Contract(address, ERC20Abi)
  return ERC20Contract
}

export const getBytes32String = (text: string): string => {
  return ethers.utils.formatBytes32String(text)
}

export const getMockSerie = async (): Promise<ISerie> => {
  const startDate = (await getBlockTimestamp()).add('10')
  const endDate = (await getBlockTimestamp()).add(BigNumber.from(24 * 8 * 60 * 60))

  return {
    startDate,
    endDate,
    numberOfProjects: 4,
    maxSupply: BigNumber.from('10000000000000000000000')
  }
}

export const awardBatch = async (
  ResiToken: ResiToken,
  role: string,
  users: string[],
  amounts: BigNumber[]
): Promise<void> => {
  let i = 0
  for (const user of users) {
    await ResiToken.award(user, role, amounts[i])
    i++
  }
}
