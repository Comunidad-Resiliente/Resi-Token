import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {ResiRegistry} from '../typechain-types'

const dateToBlockTimestamp = (date: string): string => {
  const generatedDate = new Date(date)
  return (generatedDate.getTime() / 1000).toString()
}

export const tasks = () => {
  task('create-serie', 'Create Serie')
    .addParam('startDate', 'Start Date (YYYY/MM/DD)')
    .addParam('endDate', 'End Date (YYYY/MM/DD)')
    .addParam('projects', 'Number of projects')
    .addParam('maxSupply', 'Max supply the Serie could emit (value in ether)')
    .addParam('vault', 'Address of the vault')
    .setAction(async ({startDate, endDate, projects, maxSupply, vault}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const _startDate = dateToBlockTimestamp(startDate)
      const _endDate = dateToBlockTimestamp(endDate)
      const ResiRegistry: ResiRegistry = await ethers.getContract('ResiRegistry')
      const response = await ResiRegistry.connect(admin).createSerie(_startDate, _endDate, projects, maxSupply, vault)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })
}
