import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {getManualEnvironemntInitialization, resiManualFixture} from './fixtures'
import {Signer} from 'ethers'
import {ResiRegistry, ResiSBT, ResiToken} from '../typechain-types'
import {MENTOR_ROLE, MINTER_ROLE, PROJECT_ONE, PROJECT_THREE, PROJECT_TWO} from './constants'
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

    it('Should not allow to mint if invalid address', async () => {
      await expect(ResiSBT.mint(ethers.constants.AddressZero, MINTER_ROLE, 'bla')).to.be.revertedWith(
        'ResiSBT: INVALID TO ADDRESS'
      )
    })

    it('Should not allow to mint if invalid uri', async () => {
      await expect(ResiSBT.mint(await invalidSigner.getAddress(), MINTER_ROLE, '')).to.be.revertedWith(
        'ResiSBT: EMPTY URI'
      )
    })

    it('Should not allow to mint if is not sbt receiver', async () => {
      await expect(ResiSBT.mint(await invalidSigner.getAddress(), MINTER_ROLE, 'bla')).to.be.revertedWith(
        'ResiSBT: INVALID SBT RECEIVER'
      )
    })

    it('Should not allow to mint to anyone', async () => {
      await expect(
        ResiSBT.connect(invalidSigner).mint(await invalidSigner.getAddress(), MINTER_ROLE, 'asdasas')
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('Is sbt receiver should return false', async () => {
      expect(await ResiSBT.isSBTReceiver(await user.getAddress(), MENTOR_ROLE, 0)).to.be.false
    })

    it('Should not allow to set nickname if no sbt', async () => {
      await expect(
        ResiSBT.connect(invalidSigner).setNickName(ethers.utils.formatBytes32String('bla'))
      ).to.be.revertedWith('ResiSBT: NOT AN SBT OWNER')
    })
  })
})

describe('Resi SBT interface', () => {
  let deployer: Signer, user: Signer, userTwo: Signer, userThree: Signer
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

    const {ResiSBTContract, ResiTokenContract} = await getManualEnvironemntInitialization()
    ResiSBT = ResiSBTContract
    ResiToken = ResiTokenContract

    await ResiToken.addMentor(await user.getAddress(), '1', PROJECT_ONE)
    await ResiToken.addMentor(await userTwo.getAddress(), '1', PROJECT_TWO)
    await ResiToken.addMentor(await userThree.getAddress(), '1', PROJECT_THREE)
  })

  it('Should allow to mint manually', async () => {
    //GIVEN
    const userOneSBTBalance = await ResiSBT.balanceOf(await user.getAddress())
    const isValidSBTReceiver = await ResiSBT.isSBTReceiver(await user.getAddress(), MENTOR_ROLE, '1')
    const sbtURI = 'https://ipfs:custom-uri-1'
    //WHEN
    expect(await ResiSBT.mint(await user.getAddress(), MENTOR_ROLE, sbtURI))
      .to.emit(ResiSBT, 'MintSBT')
      .withArgs(await user.getAddress(), MENTOR_ROLE, '1')
    const newUserOneSBTBalance = await ResiSBT.balanceOf(await user.getAddress())
    const ownerOfSBT = await ResiSBT.ownerOf('0')
    const expectedSBTOneURI = await ResiSBT.tokenURI('0')
    const resiTokenBalance = await ResiSBT.resiTokenBalances(await user.getAddress())
    //THEN
    expect(userOneSBTBalance).to.be.equal('0')
    expect(isValidSBTReceiver).to.be.true
    expect(newUserOneSBTBalance).to.be.equal('1')
    expect(ownerOfSBT).to.be.equal(await user.getAddress())
    expect(expectedSBTOneURI).to.be.equal(sbtURI)
    expect(resiTokenBalance).to.be.equal('0')
  })

  it('Minted sbt should be locked', async () => {
    expect(await ResiSBT.locked('0')).to.be.true
  })

  it('Not minted sbt should return false', async () => {
    expect(await ResiSBT.locked('1')).to.be.false
  })

  it('Should not allow to set nickname if invalid name', async () => {
    await expect(ResiSBT.connect(await user).setNickName(ethers.utils.formatBytes32String(''))).to.be.revertedWith(
      'ResiSBT: INVALID NICKNAME'
    )
  })

  it('Should allow to set nickname', async () => {
    //GIVEN
    const currentNickname = await ResiSBT.userNickNames(await user.getAddress())
    const nickNameToSet = ethers.utils.formatBytes32String('ExampleNickname')
    //WHEN
    await expect(ResiSBT.connect(user).setNickName(nickNameToSet))
      .to.emit(ResiSBT, 'NicknameUpdated')
      .withArgs(await user.getAddress(), nickNameToSet)
    const newNickName = await ResiSBT.userNickNames(await user.getAddress())
    //THEN
    expect(currentNickname).to.be.equal(ethers.utils.formatBytes32String(''))
    expect(ethers.utils.parseBytes32String(newNickName)).to.be.equal('ExampleNickname')
  })

  it('Try to increase manually resi token balance should result in an error even for admin user', async () => {
    await expect(ResiSBT.increaseResiTokenBalance(await user.getAddress(), '20000')).to.be.revertedWith(
      'ResiSBT: INVALID RESI TOKEN ADDRESS'
    )
  })

  it('Try to decrease manually resi token balance should result in an error even for admin user', async () => {
    await expect(ResiSBT.decreaseResiTokenBalance(await user.getAddress(), '20000')).to.be.revertedWith(
      'ResiSBT: INVALID RESI TOKEN ADDRESS'
    )
  })

  it('Should allow to mint batch by role', async () => {
    //GIVEN
    const users = [await userTwo.getAddress(), await userThree.getAddress()]
    const customURI = 'https://ipfs:custom-uri-batch'
    const sbtBalanceUserTwo = await ResiSBT.balanceOf(await userTwo.getAddress())
    const sbtBalanceUserThree = await ResiSBT.balanceOf(await userThree.getAddress())
    //WHEN
    await ResiSBT.mintBatchByRole(users, customURI, MENTOR_ROLE)
    const newSbtBalanceUserTwo = await ResiSBT.balanceOf(await userTwo.getAddress())
    const newSbtBalanceUserThree = await ResiSBT.balanceOf(await userThree.getAddress())
    //THEN
    expect(sbtBalanceUserTwo).to.be.equal('0')
    expect(sbtBalanceUserThree).to.be.equal('0')
    expect(newSbtBalanceUserTwo).to.be.equal('1')
    expect(newSbtBalanceUserThree).to.be.equal('1')
  })
})
