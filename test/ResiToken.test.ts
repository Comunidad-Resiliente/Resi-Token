import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'

describe('Resi Token', () => {
  let deployer: Signer
  let ResiTokenContract: ResiToken
  let ResiRegistryContract: ResiRegistry
  let ResiSBTContract: ResiSBT

  beforeEach(async () => {
    const data = await resiFixture()
    deployer = await ethers.getSigner(data.deployer)
  })

  it('Correct initialization', async () => {
    console.log('HOLI')
    console.log('Ok')
    console.log(ResiTokenContract)
  })
})
