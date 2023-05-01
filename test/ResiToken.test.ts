import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'

describe('Resi Token', () => {
  let deployer: Signer
  let ResiToken: ResiToken
  let ResiRegistry: ResiRegistry
  let ResiSBT: ResiSBT

  before(async () => {
    const accounts = await getNamedAccounts()
    //deployer = await ethers.getSigner(accounts.deployer)
  })

  beforeEach(async () => {
    const {ResiTokenContract, ResiRegistryContract, ResiSBTContract} = await resiFixture()
    console.log(ResiRegistryContract)
    // ResiToken = ResiTokenContract
    // ResiRegistry = ResiRegistryContract
    // ResiSBT = ResiSBTContract
  })

  it('Correct initialization', async () => {
    console.log('HOLI')
    console.log('Ok')
  })
})
