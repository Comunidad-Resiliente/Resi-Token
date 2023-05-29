import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {ResiRegistry} from '../typechain-types'

export const tasks = () => {
  task('register-serie-sbt', 'Register Serie SBT')
    .addParam('sbt', 'SBT Token')
    .setAction(async ({sbt}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
      const response = await ResiRegistry.connect(admin).registerSerieSBT(sbt)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('close-serie', 'Finish Serie').setAction(async ({}, {ethers}) => {
    const [admin]: SignerWithAddress[] = await ethers.getSigners()
    const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
    const response = await ResiRegistry.connect(admin).closeSerie()

    console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
    const receipt = await response.wait()
    if (receipt.status !== 0) {
      console.log(chalk.green('Done!'))
    } else {
      console.log(chalk.red('Failed!'))
    }
  })
}
