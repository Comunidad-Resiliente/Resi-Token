import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Contract, Signer} from 'ethers'
import {MockERC20, ResiRegistry, ResiToken, ResiVault, IERC20} from '../typechain-types'
import {getBytes32String} from '../utils'

describe('Resi Vault initial', () => {
  let deployer: Signer, user: Signer, vaultToken: Signer
  let invalidSigner: Signer
  let ResiRegistry: ResiRegistry
  let ResiToken: ResiToken
  let ResiVault: ResiVault
  let MockERC20Token: Contract

  before(async () => {
    const accounts = await getNamedAccounts()
    const signers = await ethers.getSigners()
    deployer = await ethers.getSigner(accounts.deployer)
    user = await ethers.getSigner(accounts.user)
    vaultToken = await ethers.getSigner(accounts.vaultToken)
    invalidSigner = signers[18]
  })

  before(async () => {
    const {ResiRegistryContract, ResiTokenContract, ResiVaultContract} = await resiMainFixture()
    ResiRegistry = ResiRegistryContract
    ResiToken = ResiTokenContract
    ResiVault = ResiVaultContract

    const MockERC20Factory = await ethers.getContractFactory('MockERC20')
    MockERC20Token = await MockERC20Factory.deploy('MOCKERC20', 'MERC20', '1000000000000000000000000')
    await MockERC20Token.deployed()
  })

  describe('Initialization', async () => {
    it('Correct initialization', async () => {
      //GIVEN
      const expectedSerieID = 1
      const expectedResiToken = ResiToken.address
      const expectedVaultToken = await vaultToken.getAddress()
      const expectedResiRegistry = ResiRegistry.address
      //WHEN
      const serieId = await ResiVault.SERIE_ID()
      const resiToken = await ResiVault.RESI_TOKEN()
      const tokenVault = await ResiVault.TOKEN()
      const resiRegistry = await ResiVault.RESI_REGISTRY()
      //THEN
      expect(expectedSerieID).to.be.equal(serieId)
      expect(expectedResiToken).to.be.equal(resiToken)
      expect(expectedVaultToken).to.be.equal(tokenVault)
      expect(expectedResiRegistry).to.be.equal(resiRegistry)
    })

    it('Should not allow to get balance from invalid token', async () => {
      await expect(ResiVault.tokenBalance(ethers.utils.formatBytes32String('bla'))).to.be.revertedWith(
        'ResiVault: INVALID TOKEN NAME'
      )
    })

    it('Should get native balance', async () => {
      //GIVEN
      const expectedNativeBalance = 0
      //WHEN
      const nativeBalance = await ResiVault.balance()
      //THEN
      expect(expectedNativeBalance).to.be.equal(nativeBalance)
    })

    it('Should allow to set main token', async () => {
      //GIVEN
      const mainToken = await vaultToken.getAddress()
      const newToken = MockERC20Token.address
      //WHEN
      await ResiVault.setMainToken(newToken)
      const newMainToken = await ResiVault.getMainToken()
      //THEN
      expect(newMainToken).to.be.equal(newToken)
    })

    it('Should not allow to set main token to anybody', async () => {
      await expect(ResiVault.connect(invalidSigner).setMainToken(await invalidSigner.getAddress())).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('Should not allow to set invalid main token', async () => {
      await expect(ResiVault.setMainToken(ethers.constants.AddressZero)).to.be.revertedWith(
        'ResiVault: INVALID TOKEN ADDRESS'
      )
    })

    it('Should allow to add token', async () => {
      //GIVEN
      const newToken = {
        name: 'New Token',
        address: await user.getAddress()
      }
      //WHEN
      await ResiVault.addToken(newToken.address, ethers.utils.formatBytes32String(newToken.name))
      const expectedNewToken = await ResiVault.tokens(ethers.utils.formatBytes32String(newToken.name))
      //THEN
      expect(expectedNewToken).to.be.equal(newToken.address)
    })

    it('Should not alow to add invalid token address', async () => {
      await expect(ResiVault.addToken(ethers.constants.AddressZero, getBytes32String('bla'))).to.be.revertedWith(
        'ResiVault: INVALID TOKEN ADDRESS'
      )
    })

    it('Should not allow to add invalid token name', async () => {
      await expect(ResiVault.addToken(await user.getAddress(), getBytes32String(''))).to.be.revertedWith(
        'ResiVault: INVALID TOKEN NAME'
      )
    })

    it('Should not allow to add already added token', async () => {
      await expect(ResiVault.addToken(await user.getAddress(), getBytes32String('New Token'))).to.be.revertedWith(
        'ResiVault: TOKEN ALREADY SET'
      )
    })

    it('Should not allow to add token to anybody', async () => {
      await expect(
        ResiVault.connect(invalidSigner).addToken(
          await invalidSigner.getAddress(),
          ethers.utils.formatBytes32String('bla')
        )
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })

    it('Should allow to remove token', async () => {
      //GIVEN
      const tokenNameToRemove = getBytes32String('New Token')
      //WHEN
      await expect(ResiVault.removeToken(tokenNameToRemove))
        .to.emit(ResiVault, 'TokenRemoved')
        .withArgs(tokenNameToRemove, await user.getAddress())
    })

    it('Should not allow to remove invalid token', async () => {
      await expect(ResiVault.removeToken(getBytes32String('invalid'))).to.be.revertedWith(
        'ResiVault: INVALID TOKEN NAME'
      )
    })

    it('Should not allow to remove token to anybody', async () => {
      await expect(
        ResiVault.connect(invalidSigner).removeToken(ethers.utils.formatBytes32String('bla'))
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})
