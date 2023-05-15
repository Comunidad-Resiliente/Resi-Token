import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'
import {TREASURY_ROLE} from './constants'

describe('Resi Token', () => {
  let deployer: Signer
  let treasury: string
  let invalidSigner: Signer
  let ResiRegistry: ResiRegistry
  let ResiToken: ResiToken

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    treasury = accounts.treasury
    invalidSigner = signers[18]
  })

  beforeEach(async () => {
    const {ResiRegistryContract, ResiTokenContract} = await resiMainFixture()
    ResiRegistry = ResiRegistryContract
    ResiToken = ResiTokenContract
  })

  describe('Initialization', async () => {
    it('Correct initialization', async () => {
      //GIVEN
      const expectedOwner: string = await deployer.getAddress()
      const expectedRegistry: string = ResiRegistry.address
      //WHEN
      const owner: string = await ResiToken.owner()
      const registry: string = await ResiToken.RESI_REGISTRY()
      const hasTreasuryRole: boolean = await ResiToken.hasRole(TREASURY_ROLE, treasury)
      //THEN
      expect(owner).to.be.equal(expectedOwner)
      expect(registry).to.be.equal(expectedRegistry)
      expect(hasTreasuryRole).to.be.true
    })

    it('Cannot re initialize contract', async () => {
      expect(await ResiToken.initialize(treasury, ResiRegistry.address)).to.be.revertedWith(
        'Initializable: contract is already initialized'
      )
    })
  })
})
