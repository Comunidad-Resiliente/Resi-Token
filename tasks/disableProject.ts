import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {ResiRegistry} from '../typechain-types'

export const tasks = () => {
  task('disable-project', 'Disable project')
    .addParam('name', 'Project name')
    .setAction(async ({name}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
      const bytesProjectName = ethers.utils.formatBytes32String(name)
      const response = await ResiRegistry.connect(admin).disableProject(bytesProjectName)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })
}
