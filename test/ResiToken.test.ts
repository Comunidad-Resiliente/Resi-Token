import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {getManualEnvironemntInitialization, resiMainFixture, resiManualFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'
import {
  MENTOR_ROLE,
  MINTER_ROLE,
  PROJECT_BUILDER_ROLE,
  PROJECT_ONE,
  PROJECT_TWO,
  RESI_BUILDER_ROLE,
  TREASURY_ROLE
} from './constants'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

describe('Resi Token initial', () => {
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

    it('Should not allow to remove mentor to anybody', async () => {
      await expect(ResiToken.connect(invalidSigner).removeMentor(await deployer.getAddress())).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
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

    it('Should not allow to remove resi builder to anybody', async () => {
      await expect(ResiToken.connect(invalidSigner).removeResiBuilder(await deployer.getAddress())).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should not allow to execute transfer', async () => {
      await expect(ResiToken.connect(user).transfer(await deployer.getAddress(), '10')).to.be.revertedWithCustomError(
        ResiToken,
        'TransferForbidden'
      )
    })

    it('Should not allow to execute transfer from', async () => {
      await expect(
        ResiToken.connect(user).transferFrom(await deployer.getAddress(), await deployer.getAddress(), '10')
      ).to.be.revertedWithCustomError(ResiToken, 'TransferFromForbidden')
    })

    it('Should not allow to award to anybody', async () => {
      await expect(ResiToken.connect(user).award(await user.getAddress(), MENTOR_ROLE, '10')).to.be.revertedWith(
        `AccessControl: account ${(await user.getAddress()).toLowerCase()} is missing role ${MINTER_ROLE}`
      )
    })

    it('Should not allow to exit', async () => {
      await expect(ResiToken.connect(user).exit('2', MENTOR_ROLE)).to.be.revertedWith(`ACCOUNT HAS NOT VALID ROLE`)
    })
  })
})

describe('Inteface', async () => {
  let deployer: Signer
  let user: Signer, userTwo: Signer, userThree: Signer
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
    userTwo = signers[17]
    userThree = signers[16]

    const {ResiRegistryContract, ResiTokenContract} = await getManualEnvironemntInitialization()
    ResiRegistry = ResiRegistryContract
    ResiToken = ResiTokenContract
  })

  it('Should allow to add mentor', async () => {
    //GIVEN
    const mentor = await user.getAddress()
    //WHEN
    await ResiToken.addMentor(mentor, '1', PROJECT_ONE)
    const amountOfMentors = await ResiToken.getRoleMemberCount(MENTOR_ROLE)
    const isMentor = await ResiToken.hasRole(MENTOR_ROLE, mentor)
    //THEN
    expect(amountOfMentors).to.be.equal('1')
    expect(isMentor).to.be.true
  })

  it('Add mentor should emit event', async () => {
    //GIVEN
    const mentor = await userTwo.getAddress()
    //WHEN //THEN
    await expect(ResiToken.addMentor(mentor, '1', PROJECT_TWO))
      .to.emit(ResiToken, 'MentorAdded')
      .withArgs(mentor, PROJECT_TWO)
  })

  it('Should allow to remove mentor', async () => {
    //GIVEN
    const mentorToRemove = await userTwo.getAddress()
    const mentorCount = await ResiToken.getRoleMemberCount(MENTOR_ROLE)
    //WHEN
    await ResiToken.removeMentor(mentorToRemove)
    const newMentorCount = await ResiToken.getRoleMemberCount(MENTOR_ROLE)
    const isMentor = await ResiToken.hasRole(MENTOR_ROLE, mentorToRemove)
    //THEN
    expect(mentorCount).to.be.equal('2')
    expect(newMentorCount).to.be.equal('1')
    expect(isMentor).to.be.false
  })

  it('Should allow to add project builder', async () => {
    //GIVEN
    const projectBuilder = await userThree.getAddress()
    //WHEN
    await ResiToken.addProjectBuilder(projectBuilder, '1', PROJECT_ONE)
    const amountOfProjectBuilders = await ResiToken.getRoleMemberCount(PROJECT_BUILDER_ROLE)
    const isProjectBuilder = await ResiToken.hasRole(PROJECT_BUILDER_ROLE, projectBuilder)
    //THEN
    expect(amountOfProjectBuilders).to.be.equal('1')
    expect(isProjectBuilder).to.be.true
  })

  xit('Should allow to remove project builder', async () => {})

  xit('Should allow to add Resi builder', async () => {})

  xit('Should allow to remove Resi builder', async () => {})

  xit('Should allow to award', async () => {})

  xit('Award should emit event', async () => {})
})
