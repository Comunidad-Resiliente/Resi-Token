import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken, ResiVault} from '../typechain-types'
import {MENTOR_ROLE, PROJECT_BUILDER_ROLE, RESI_BUILDER_ROLE, TREASURY_ROLE} from './constants'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

describe('Resi Vault initial', () => {
  let deployer: Signer
  let user: Signer
  let invalidSigner: Signer
  let ResiRegistry: ResiRegistry
  let ResiToken: ResiToken
  let ResiVault: ResiVault

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    user = await ethers.getSigner(accounts.user)
    invalidSigner = signers[18]
  })

  beforeEach(async () => {
    const {ResiRegistryContract, ResiTokenContract, ResiVaultContract} = await resiMainFixture()
    ResiRegistry = ResiRegistryContract
    ResiToken = ResiTokenContract
    ResiVault = ResiVaultContract
  })

  describe('Initialization', async () => {
    it('ALL OK', async () => {
      console.log('all ok')
    })
  })
})
