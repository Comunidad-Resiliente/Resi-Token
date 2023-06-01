import {ethers} from 'hardhat'
import {BigNumber, Contract} from 'ethers'

const ERC20Abi = ['function balanceOf(address owner) view returns (uint256)']

export const getBlockTimestamp = async () => {
  const block = await ethers.provider.getBlock('latest')
  return BigNumber.from(block.timestamp)
}

export const advanceTime = async (time: number) => {
  await ethers.provider.send('evm_increaseTime', [time])
}

export const getERC20 = async (address: string): Promise<Contract> => {
  const ERC20Contract = new ethers.Contract(address, ERC20Abi)
  return ERC20Contract
}

export const getBytes32String = (text: string): string => {
  return ethers.utils.formatBytes32String(text)
}
