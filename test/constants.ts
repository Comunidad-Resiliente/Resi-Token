import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'
import {BigNumber} from 'ethers'
import {ethers} from 'hardhat'

export const MINTER_ROLE = keccak256(toUtf8Bytes('MINTER_ROLE'))
export const MENTOR_ROLE = keccak256(toUtf8Bytes('MENTOR_ROLE'))
export const TREASURY_ROLE = keccak256(toUtf8Bytes('TREASURY_ROLE'))
export const PROJECT_BUILDER_ROLE = keccak256(toUtf8Bytes('PROJECT_BUILDER_ROLE'))
export const RESI_BUILDER_ROLE = keccak256(toUtf8Bytes('RESI_BUILDER_ROLE'))

export const PROJECT_ONE = ethers.utils.formatBytes32String('PROJECT ONE')
export const PROJECT_TWO = ethers.utils.formatBytes32String('PROJECT TWO')
export const PROJECT_THREE = ethers.utils.formatBytes32String('PROJECT THREE')
export const PROJECT_FOUR = ethers.utils.formatBytes32String('PROJECT FOUR')

export interface ISerie {
  startDate: BigNumber
  endDate: BigNumber
  numberOfProjects: number
  maxSupply: BigNumber
  vault?: string
}
