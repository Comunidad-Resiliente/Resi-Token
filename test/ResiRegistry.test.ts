import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

describe('Resi Registry', () => {
  let deployer: Signer
  let invalidSigner: Signer
  let ResiRegistry: ResiRegistry

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    invalidSigner = signers[18]
  })

  beforeEach(async () => {
    const {ResiRegistryContract} = await resiMainFixture()
    ResiRegistry = ResiRegistryContract
  })

  describe('Initialization', async () => {
    it('Correct initialization', async () => {
      //GIVEN
      const expectedOwner: string = await deployer.getAddress()
      //WHEN
      const owner: string = await ResiRegistry.owner()
      //THEN
      expect(owner).to.equal(expectedOwner)
    })

    it('Cannot re initialize contract', async () => {
      expect(await ResiRegistry.initialize).to.be.revertedWith('Initializable: contract is already initialized')
    })

    it('Active serie should be zero at creation', async () => {
      //GIVEN  //WHEN
      const activeSerie = await ResiRegistry.activeSerie()
      //THEN
      expect(activeSerie).to.be.equal('0')
    })

    it('Not registered project should return is not valid', async () => {
      //GIVEN
      const fakeProjectName = keccak256(toUtf8Bytes('Fake project'))
      const serie = 2
      //WHEN
      const isValid = await ResiRegistry['isValidProject(uint256,bytes32)'](serie, fakeProjectName)
      //THEN
      expect(isValid).to.be.false
    })

    it('Not registered project should return is not valid in active serie', async () => {
      //GIVEN
      const fakeProjectName = keccak256(toUtf8Bytes('Fake project'))
      //WHEN
      const isValid = await ResiRegistry['isValidProject(bytes32)'](fakeProjectName)
      //THEN
      expect(isValid).to.be.false
    })

    it('Get sbt serie should return zero address', async () => {
      expect(await ResiRegistry['getSBTSerie()']()).to.be.equal(ethers.constants.AddressZero)
    })

    it('Get serie state should return not active and none supply', async () => {
      //GIVEN
      const serie = 4
      //WHEN
      const serieSate = await ResiRegistry.getSerieState(serie)
      const isActive = serieSate[0]
      const currentSupply = serieSate[1]
      //THEN
      expect(isActive).to.be.false
      expect(currentSupply).to.be.equal('0')
    })

    it('Should not allow to set an invalid resi token address', async () => {
      expect(await ResiRegistry.setResiToken(ethers.constants.AddressZero)).to.be.revertedWith(
        'RESIRegistry: INVALID TOKEN ADDRESS'
      )
    })

    it('Should not allow to set resi token to anybody', async () => {
      //GIVEN
      const resiAddress: string = await deployer.getAddress()
      //WHEN //THEN
      expect(await ResiRegistry.connect(invalidSigner).setResiToken(resiAddress)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should allow to set resi token', async () => {
      //GIVEN
      const resiAddressToSet = await deployer.getAddress()
      //WHEN
      expect(await ResiRegistry.setResiToken(resiAddressToSet))
        .to.emit(ResiRegistry, 'ResiTokenSet')
        .withArgs(resiAddressToSet)
      const newResiAddress = await ResiRegistry.RESI_TOKEN()
      //THEN
      expect(newResiAddress).to.be.equal(resiAddressToSet)
    })

    //TODO: REVIEW TREASURY VAULT FUNCTIONALITY
    xit('Should not allow to set an invalid treasury vault', async () => {})

    it('Should not allow add project to an invalid serie', async () => {
      //GIVEN
      const fakeProjectName = keccak256(toUtf8Bytes('Fake project'))
      //WHEN //THEN
      expect(await ResiRegistry.addProject(fakeProjectName)).to.be.revertedWith('RESIRegistry: SERIE INACTIVE')
    })

    it('Should not allow to add a project to anybody', async () => {
      //GIVEN
      const fakeProjectName = keccak256(toUtf8Bytes('Fake project'))
      //WHEN THEN
      expect(await ResiRegistry.connect(invalidSigner).addProject(fakeProjectName)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should not allow add projects to an invalid serie', async () => {
      //GIVEN
      const fakeProjectOne = keccak256(toUtf8Bytes('Fake project1'))
      const fakeProjectTwo = keccak256(toUtf8Bytes('Fake project2'))
      const projects = [fakeProjectOne, fakeProjectTwo]
      //WHEN //THEN
      expect(await ResiRegistry.addProjects(projects)).to.be.revertedWith('RESIRegistry: SERIE INACTIVE')
    })

    it('Should not allow to add projects to anybody', async () => {
      //GIVEN
      const fakeProjectOne = keccak256(toUtf8Bytes('Fake project1'))
      const fakeProjectTwo = keccak256(toUtf8Bytes('Fake project2'))
      const projects = [fakeProjectOne, fakeProjectTwo]
      //WHEN  //THEN
      expect(await ResiRegistry.connect(invalidSigner).addProjects(projects)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should allow to disable a project', async () => {
      //GIVEN
      const fakeProject = keccak256(toUtf8Bytes('Fake project'))
      //WHEN
      await ResiRegistry.disableProject(fakeProject)
      const project = await ResiRegistry.projects(fakeProject)
      const projectSerie = project[0]
      const isActive = project[1]
      //THEN
      expect(projectSerie).to.be.equal('0')
      expect(isActive).to.be.false
    })

    it('Should not allow to register serieSBT', async () => {
      expect(await ResiRegistry.registerSerieSBT(ethers.constants.AddressZero)).to.be.revertedWith(
        'RESIRegisty: SERIE NOT ACTIVE'
      )
    })

    it('Should not allow to register serieSBT to anybody', async () => {
      expect(
        await ResiRegistry.connect(invalidSigner).registerSerieSBT(ethers.constants.AddressZero)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('Should not allow to increase inactive serie supply', async () => {
      expect(await ResiRegistry.increaseSerieSupply(3, 0)).to.be.revertedWith('RESIRegistry: INVALID SERIE')
    })

    it('Should not allow to increase serie supply to anybody', async () => {
      expect(await ResiRegistry.connect(invalidSigner).increaseSerieSupply(3, 0)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should not allow to decrease invalid serie', async () => {
      expect(await ResiRegistry.decreaseSerieSupply(3, 0)).to.be.revertedWith('RESIRegistry: INVALID SERIE')
    })

    it('Should not allow to decrease serie supply to anybody', async () => {
      expect(await ResiRegistry.connect(invalidSigner).decreaseSerieSupply(3, 0)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should not allow to close invalid serie', async () => {
      expect(await ResiRegistry.closeSerie()).to.be.revertedWith('RESIRegistry: SERIE NOT CREATED YET')
    })

    it('Should not allow to close serie to anybody', async () => {
      expect(await ResiRegistry.connect(invalidSigner).closeSerie()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
