import {expect} from 'chai'
import {ethers, getNamedAccounts} from 'hardhat'
import {resiMainFixture} from './fixtures'
import {Signer} from 'ethers'
import {MockERC20, ResiRegistry, ResiSBT, ResiToken, ResiVault} from '../typechain-types'
import {MENTOR_ROLE, PROJECT_BUILDER_ROLE, RESI_BUILDER_ROLE, TREASURY_ROLE} from './constants'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

describe('Resi Vault initial', () => {
  let deployer: Signer, user: Signer, vaultToken: Signer
  let invalidSigner: Signer
  let ResiRegistry: ResiRegistry
  let ResiToken: ResiToken
  let ResiVault: ResiVault
  let MockERC20Token: MockERC20

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
    const MockERC20Token = await MockERC20Factory.deploy('MOCKERC20', 'MERC20', '1000000000000000000000000')
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

    xit('Should get the main token balance', async () => {
      //GIVEN
      const expectedMainTokenBalance = 0
      //WHEN
      const mainTokenBalance = await ResiVault.getMainToken()
      //THEN
    })

    it('Should get token balance from tokens mapping', async () => {})

    it('Should not allow to get balance from invalid token', async () => {})

    it('Should get native balance', async () => {})

    it('Should allow to set main token', async () => {})

    it('Should not allow to set main token to anybody', async () => {})

    it('Should not allow to set invalid main token', async () => {})
  })
})
