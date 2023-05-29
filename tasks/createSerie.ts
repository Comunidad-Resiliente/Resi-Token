import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {ResiRegistry} from '../typechain-types'

export const tasks = () => {
  task('create-serie', 'Create Serie')
    .addParam('start-date', 'Start Date')
    .addParam('end-date', 'End Date')
    .addParam('projects', 'Number of projects')
    .addParam('max-supply', 'Max supply the Serie could emit')
    .addParam('vault', 'Address of the vault')
    .setAction(async ({startDate, endDate, projects, maxSupply, vault}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
      const response = await ResiRegistry.connect(admin).createSerie(startDate, endDate, projects, maxSupply, vault)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })
}
