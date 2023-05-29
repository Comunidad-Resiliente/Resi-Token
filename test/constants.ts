import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

export const MINTER_ROLE = keccak256(toUtf8Bytes('MINTER_ROLE'))
export const MENTOR_ROLE = keccak256(toUtf8Bytes('MENTOR_ROLE'))
export const TREASURY_ROLE = keccak256(toUtf8Bytes('TREASURY_ROLE'))
export const PROJECT_BUILDER_ROLE = keccak256(toUtf8Bytes('PROJECT_BUILDER_ROLE'))
export const RESI_BUILDER_ROLE = keccak256(toUtf8Bytes('RESI_BUILDER_ROLE'))

export const PROJECT_ONE = keccak256(toUtf8Bytes('PROJECT ONE'))
export const PROJECT_TWO = keccak256(toUtf8Bytes('PROJECT TWO'))
export const PROJECT_THREE = keccak256(toUtf8Bytes('PROJECT THREE'))
