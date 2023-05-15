import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'
import {MENTOR_ROLE, PROJECT_BUILDER_ROLE, RESI_BUILDER_ROLE, TREASURY_ROLE} from './constants'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

describe('Resi Token', () => {
  let deployer: Signer
  let user: Signer
  let treasury: string
  let invalidSigner: Signer
  let ResiRegistry: ResiRegistry
  let ResiToken: ResiToken

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    user = await ethers.getSigner(accounts.user)
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
      await expect(ResiToken.initialize(treasury, ResiRegistry.address)).to.be.revertedWith(
        'Initializable: contract is already initialized'
      )
    })

    it('Should get role count', async () => {
      //GIVEN
      const expectedRoleCount = 4
      //WHEN
      const roleCount = await ResiToken.getRoleCount()
      //THEN
      expect(expectedRoleCount).to.be.equal(roleCount)
    })

    it('Should get role by index', async () => {
      //GIVEN
      const roles = []
      for (let i = 0; i < 4; i++) {
        //WHEN
        const roleName = await ResiToken.getRoleByIndex(i)
        roles.push(roleName)
      }

      //THEN
      expect(roles[0]).to.be.equal(MENTOR_ROLE)
      expect(roles[1]).to.be.equal(TREASURY_ROLE)
      expect(roles[2]).to.be.equal(PROJECT_BUILDER_ROLE)
      expect(roles[3]).to.be.equal(RESI_BUILDER_ROLE)
    })

    it('Is sbt receiver should return false', async () => {
      expect(await ResiToken.isSBTReceiver(await user.getAddress(), MENTOR_ROLE, 0)).to.be.false
    })

    it('Should not add mentor', async () => {
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      await expect(ResiToken.addMentor(await user.getAddress(), 0, fakeProject)).to.be.revertedWith(
        'RESIToken: INVALID OR INACTIVE SERIE, PROJECT NOT EXIST OR NOT ACTIVE'
      )
    })

    it('Should not allow to add mentor to anybody', async () => {
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      await expect(
        ResiToken.connect(invalidSigner).addMentor(await user.getAddress(), 0, fakeProject)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('Should not add project builder', async () => {
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      await expect(ResiToken.addProjectBuilder(await user.getAddress(), 0, fakeProject)).to.be.revertedWith(
        'RESIToken: INVALID OR INACTIVE SERIE, PROJECT NOT EXIST OR NOT ACTIVE'
      )
    })

    it('Should not allow to add project builder to anybody', async () => {
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      await expect(
        ResiToken.connect(invalidSigner).addProjectBuilder(await user.getAddress(), 0, fakeProject)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})
