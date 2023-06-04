import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture, resiManualFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'
import {MENTOR_ROLE, MINTER_ROLE, PROJECT_BUILDER_ROLE, RESI_BUILDER_ROLE, TREASURY_ROLE} from './constants'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

describe('Resi SBT initial', () => {
  let deployer: Signer
  let user: Signer
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
  })

  beforeEach(async () => {
    const {ResiRegistryContract, ResiTokenContract, ResiSBTContract} = await resiManualFixture()
    ResiRegistry = ResiRegistryContract
    ResiToken = ResiTokenContract
    ResiSBT = ResiSBTContract
  })

  describe('Initialization', async () => {
    it('Correct initialization', async () => {
      //GIVEN
      const expectedName = 'RESI SBT'
      const expectedSymbol = 'RSBT'
      const expectedContractUri = 'https://ipfs'
      const expectedSerieId = '1'
      const expectedRegistry = ResiRegistry.address
      const expectedToken = ResiToken.address
      //WHEN
      const name = await ResiSBT.name()
      const symbol = await ResiSBT.symbol()
      const contractUri = await ResiSBT.contractUri()
      const serieId = await ResiSBT.SERIE_ID()
      const registry = await ResiSBT.RESI_REGISTRY()
      const token = await ResiSBT.RESI_TOKEN()
      //THEN
      expect(name).to.be.equal(expectedName)
      expect(symbol).to.be.equal(expectedSymbol)
      expect(contractUri).to.be.equal(expectedContractUri)
      expect(serieId).to.be.equal(expectedSerieId)
      expect(registry).to.be.equal(expectedRegistry)
      expect(token).to.be.equal(expectedToken)
    })

    it('Should allow to set contract uri', async () => {
      //GIVEN
      const newContractUri = 'https://ipfs-nueva'
      //WHEN
      await expect(ResiSBT.setContractURI(newContractUri))
        .to.emit(ResiSBT, 'ContractURIUpdated')
        .withArgs(newContractUri)
      const expectedContractUri = await ResiSBT.contractUri()
      //THEN
      expect(newContractUri).to.be.equal(expectedContractUri)
    })

    it('Should not allow to set contract uri to anyone', async () => {
      await expect(ResiSBT.connect(invalidSigner).setContractURI('bla')).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should allow to change registry', async () => {
      //GIVEN
      const newRegistry = await user.getAddress()
      //WHEN
      await expect(ResiSBT.setRegistry(newRegistry)).to.emit(ResiSBT, 'RegistrySet').withArgs(newRegistry)
      const expectedNewRegistry = await ResiSBT.RESI_REGISTRY()
      //THEN
      expect(newRegistry).to.be.equal(expectedNewRegistry)
    })

    it('Should not allow to set registry to anyone', async () => {
      await expect(ResiSBT.connect(invalidSigner).setRegistry(await invalidSigner.getAddress())).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should allow to set default role uri', async () => {
      //GIVEN
      const newDefaultTokenURI = 'https://ipfs-default-toke-uri'
      const role = MENTOR_ROLE
      //WHEN //THEN
      await expect(ResiSBT.setDefaultRoleUri(role, newDefaultTokenURI))
        .to.emit(ResiSBT, 'DefaultRoleUriUpdated')
        .withArgs('', newDefaultTokenURI)
    })

    it('Should not allow to set default role uri to anyone', async () => {
      await expect(ResiSBT.connect(invalidSigner).setDefaultRoleUri(MINTER_ROLE, 'bla')).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Transfer from should be not allowed', async () => {
      await expect(
        ResiSBT.transferFrom(await deployer.getAddress(), await deployer.getAddress(), '10000')
      ).to.be.revertedWithCustomError(ResiSBT, 'TransferForbidden')
    })

    it('Transfer from should not be allowed', async () => {
      await expect(
        ResiSBT['safeTransferFrom(address,address,uint256)'](
          await deployer.getAddress(),
          await deployer.getAddress(),
          '10000'
        )
      ).to.be.revertedWithCustomError(ResiSBT, 'TransferForbidden')
    })

    it('Transfer from with bytes data should not be allowed', async () => {
      await expect(
        ResiSBT['safeTransferFrom(address,address,uint256,bytes)'](
          await deployer.getAddress(),
          await deployer.getAddress(),
          '10000',
          keccak256(toUtf8Bytes('asdas'))
        )
      ).to.be.revertedWithCustomError(ResiSBT, 'TransferForbidden')
    })

    xit('Should allow to mint', async () => {})

    xit('Should not allow to mint to anyone', async () => {})

    xit('Mint should emit event', async () => {})
  })
})
