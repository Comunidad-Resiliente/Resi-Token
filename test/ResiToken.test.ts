import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {getManualEnvironemntInitialization, resiMainFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'
import {
  ADMIN_ROLE,
  MENTOR_ROLE,
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
      const owner: boolean = await ResiToken.hasRole(ADMIN_ROLE, expectedOwner)
      const registry: string = await ResiToken.RESI_REGISTRY()
      const hasTreasuryRole: boolean = await ResiToken.hasRole(TREASURY_ROLE, treasury)
      //THEN
      expect(owner).to.be.true
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
      const expectedRoleCount = 3
      //WHEN
      const roleCount = await ResiToken.getRoleCount()
      //THEN
      expect(expectedRoleCount).to.be.equal(roleCount)
    })

    it('Is sbt receiver should return false', async () => {
      expect(await ResiToken.isSBTReceiver(await user.getAddress(), MENTOR_ROLE, 0)).to.be.false
    })

    it('Should not add mentor', async () => {
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      await expect(ResiToken.addMentor(await user.getAddress(), 0, fakeProject)).to.be.revertedWith(
        'ResiToken: INVALID OR INACTIVE SERIE OR PROJECT'
      )
    })

    it('Should not allow to add mentor to anybody', async () => {
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      await expect(
        ResiToken.connect(invalidSigner).addMentor(await user.getAddress(), 0, fakeProject)
      ).to.be.revertedWith(
        `AccessControl: account ${(await invalidSigner.getAddress()).toLowerCase()} is missing role ${ADMIN_ROLE}`
      )
    })

    it('Should not allow to remove mentor to anybody', async () => {
      await expect(
        ResiToken.connect(invalidSigner).removeUserRole(MENTOR_ROLE, await deployer.getAddress())
      ).to.be.revertedWith(
        `AccessControl: account ${(await invalidSigner.getAddress()).toLowerCase()} is missing role ${ADMIN_ROLE}`
      )
    })

    it('Should not add project builder', async () => {
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      await expect(ResiToken.addProjectBuilder(await user.getAddress(), 0, fakeProject)).to.be.reverted
    })

    it('Should not allow to add project builder to anybody', async () => {
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      await expect(
        ResiToken.connect(invalidSigner).addProjectBuilder(await user.getAddress(), 0, fakeProject)
      ).to.be.revertedWith(
        `AccessControl: account ${(await invalidSigner.getAddress()).toLowerCase()} is missing role ${ADMIN_ROLE}`
      )
    })

    it('Should not allow to remove resi builder to anybody', async () => {
      await expect(
        ResiToken.connect(invalidSigner).removeUserRole(RESI_BUILDER_ROLE, await deployer.getAddress())
      ).to.be.revertedWith(
        `AccessControl: account ${(await invalidSigner.getAddress()).toLowerCase()} is missing role ${ADMIN_ROLE}`
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
        `AccessControl: account ${(await user.getAddress()).toLowerCase()} is missing role ${ADMIN_ROLE}`
      )
    })

    it('Should not allow to exit', async () => {
      await expect(ResiToken.connect(user).exit('2', MENTOR_ROLE)).to.be.revertedWith(
        `ResiToken: ACCOUNT HAS NOT VALID ROLE`
      )
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
  let ResiSBT: ResiSBT

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    user = await ethers.getSigner(accounts.user)
    treasury = accounts.treasury
    invalidSigner = signers[18]
    userTwo = signers[17]
    userThree = signers[16]

    const {ResiRegistryContract, ResiTokenContract, ResiSBTContract} = await getManualEnvironemntInitialization()
    ResiRegistry = ResiRegistryContract
    ResiToken = ResiTokenContract
    ResiSBT = ResiSBTContract
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

  it('Is SBT Reciever should return true for added mentor', async () => {
    expect(await ResiToken.isSBTReceiver(await user.getAddress(), MENTOR_ROLE, '1')).to.be.true
  })

  it('Should allow to remove mentor', async () => {
    //GIVEN
    const mentorToRemove = await userTwo.getAddress()
    const mentorCount = await ResiToken.getRoleMemberCount(MENTOR_ROLE)
    //WHEN
    await ResiToken.removeUserRole(MENTOR_ROLE, mentorToRemove)
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
    await expect(ResiToken.addProjectBuilder(projectBuilder, '1', PROJECT_ONE))
      .to.emit(ResiToken, 'ProjectBuilderAdded')
      .withArgs(projectBuilder)
    const amountOfProjectBuilders = await ResiToken.getRoleMemberCount(PROJECT_BUILDER_ROLE)
    const isProjectBuilder = await ResiToken.hasRole(PROJECT_BUILDER_ROLE, projectBuilder)
    //THEN
    expect(amountOfProjectBuilders).to.be.equal('1')
    expect(isProjectBuilder).to.be.true
  })

  it('Should allow to remove project builder', async () => {
    //GIVEN
    const projectBuilderToRemove = await userThree.getAddress()
    //WHEN
    await ResiToken.removeUserRole(PROJECT_BUILDER_ROLE, projectBuilderToRemove)
    const amountOfProjectBuilders = await ResiToken.getRoleMemberCount(PROJECT_BUILDER_ROLE)
    const isProjectBuilder = await ResiToken.hasRole(PROJECT_BUILDER_ROLE, projectBuilderToRemove)
    //THEN
    expect(amountOfProjectBuilders).to.be.equal('0')
    expect(isProjectBuilder).to.be.false
  })

  it('Should allow to add Resi builder', async () => {
    //GIVEN
    const resiBuilder = await userThree.getAddress()
    //WHEN
    await expect(ResiToken.addResiBuilder(resiBuilder)).to.emit(ResiToken, 'ResiBuilderAdded').withArgs(resiBuilder)
    const amountOfResiBuilders = await ResiToken.getRoleMemberCount(RESI_BUILDER_ROLE)
    const isResiBuilder = await ResiToken.hasRole(RESI_BUILDER_ROLE, resiBuilder)
    //THEN
    expect(amountOfResiBuilders).to.be.equal('1')
    expect(isResiBuilder).to.be.true
  })

  it('Should allow to remove Resi builder', async () => {
    //GIVEN
    const resiBuilderToRemove = await userThree.getAddress()
    //WHEN
    await ResiToken.removeUserRole(RESI_BUILDER_ROLE, resiBuilderToRemove)
    const amountOfResiBuilders = await ResiToken.getRoleMemberCount(RESI_BUILDER_ROLE)
    const isResiBuilder = await ResiToken.hasRole(RESI_BUILDER_ROLE, resiBuilderToRemove)
    //THEN
    expect(amountOfResiBuilders).to.be.equal('0')
    expect(isResiBuilder).to.be.false
  })

  it('Should not allow to add roles batch if invalid address', async () => {
    await expect(
      ResiToken.addRolesBatch(MENTOR_ROLE, [await userTwo.getAddress(), ethers.constants.AddressZero])
    ).to.be.revertedWithCustomError(ResiToken, 'InvalidAddress')
  })

  it('Should allow to add roles batch', async () => {
    //GIVEN
    const mentorsToAdd = [await userTwo.getAddress(), await userThree.getAddress()]
    //WHEN
    await ResiToken.addRolesBatch(MENTOR_ROLE, mentorsToAdd)
    const amountOfMentors = await ResiToken.getRoleMemberCount(MENTOR_ROLE)
    const isMentorUserTwo = await ResiToken.hasRole(MENTOR_ROLE, await userTwo.getAddress())
    const isMentorUserThree = await ResiToken.hasRole(MENTOR_ROLE, await userThree.getAddress())
    //THEN
    expect(amountOfMentors).to.be.equal('3')
    expect(isMentorUserTwo).to.be.true
    expect(isMentorUserThree).to.be.true
  })

  it('Should allow to award', async () => {
    //GIVEN
    const userToAward = await user.getAddress()
    const amountToAward = '20000'
    const sbtBalance = await ResiSBT.balanceOf(userToAward)
    const resiTokenBalance = await ResiToken.balanceOf(userToAward)
    const serieResiMinted = await ResiRegistry.getSerieSupply('1')
    const sbtResiTokenBalance = await ResiSBT.resiTokenBalances(userToAward)

    //WHEN
    await expect(ResiToken.award(await user.getAddress(), MENTOR_ROLE, amountToAward))
      .to.emit(ResiToken, 'ResiMinted')
      .withArgs(userToAward, amountToAward)

    const newSbtBalance = await ResiSBT.balanceOf(userToAward)
    const newResiTokenBalance = await ResiToken.balanceOf(userToAward)
    const newSerieResiMinted = await ResiRegistry.getSerieSupply('1')
    const newSbtResiTokenBalance = await ResiSBT.resiTokenBalances(userToAward)

    //THEN
    expect(sbtBalance).to.be.equal('0')
    expect(resiTokenBalance).to.be.equal('0')
    expect(serieResiMinted).to.be.equal('0')
    expect(sbtResiTokenBalance).to.be.equal('0')

    expect(newSbtBalance).to.be.equal('1')
    expect(newResiTokenBalance).to.be.equal(amountToAward)
    expect(newSerieResiMinted).to.be.equal(amountToAward)
    expect(newSbtResiTokenBalance).to.be.equal(amountToAward)
  })

  it('Award to someone with SBT should not mint a new one', async () => {
    //GIVEN
    const userToAward = await user.getAddress()
    const amountToAward = '20000'
    const sbtBalance = await ResiSBT.balanceOf(userToAward)
    const resiTokenBalance = await ResiToken.balanceOf(userToAward)
    const serieResiMinted = await ResiRegistry.getSerieSupply('1')
    const sbtResiTokenBalance = await ResiSBT.resiTokenBalances(userToAward)

    //WHEN
    await expect(ResiToken.award(await user.getAddress(), MENTOR_ROLE, amountToAward))
      .to.emit(ResiToken, 'ResiMinted')
      .withArgs(userToAward, amountToAward)

    const newSbtBalance = await ResiSBT.balanceOf(userToAward)
    const newResiTokenBalance = await ResiToken.balanceOf(userToAward)
    const newSerieResiMinted = await ResiRegistry.getSerieSupply('1')
    const newSbtResiTokenBalance = await ResiSBT.resiTokenBalances(userToAward)

    //THEN
    expect(sbtBalance).to.be.equal('1')
    expect(resiTokenBalance).to.be.equal('20000')
    expect(serieResiMinted).to.be.equal('20000')
    expect(sbtResiTokenBalance).to.be.equal('20000')

    expect(newSbtBalance).to.be.equal('1')
    expect(newResiTokenBalance).to.be.equal('40000')
    expect(newSerieResiMinted).to.be.equal('40000')
    expect(newSbtResiTokenBalance).to.be.equal('40000')
  })
})
