import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {ResiRegistry} from '../typechain-types'

export const tasks = () => {
  task('set-resi-token', 'Set Resi Token')
    .addParam('resi-token', 'Resi Token')
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
    .addParam('treasury-vault', 'Treasury vault')
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
}
