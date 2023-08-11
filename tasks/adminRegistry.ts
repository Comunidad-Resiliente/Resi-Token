import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {ResiRegistry} from '../typechain-types'

export const tasks = () => {
  task('set-resi-token', 'Set Resi Token')
    .addParam('resiToken', 'Resi Token')
    .setAction(async ({resiToken}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
      const response = await ResiRegistry.connect(admin).setResiToken(resiToken)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('set-treasury-vault', 'Set Treasury vault')
    .addParam('treasuryVault', 'Treasury vault')
    .setAction(async ({treasuryVault}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
      const response = await ResiRegistry.connect(admin).setTreasuryVault(treasuryVault)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('get-active-serie', 'Get active serie state').setAction(async ({serieId}, {ethers}) => {
    const [admin]: SignerWithAddress[] = await ethers.getSigners()
    const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
    const activeSerie = await ResiRegistry.connect(admin).activeSerie()
    const serieState = await ResiRegistry.connect(admin).getSerieState(activeSerie)

    console.log(activeSerie)
    console.log('-------')
    console.log(serieState)
  })
  task('get-project', 'Get active serie').setAction(async ({}, {ethers}) => {
    const [admin]: SignerWithAddress[] = await ethers.getSigners()
    const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
    const response = await ResiRegistry.connect(admin).projects(ethers.utils.formatBytes32String('PROJECT_1'))

    console.log(response)
    console.log('-------')
  })
}
