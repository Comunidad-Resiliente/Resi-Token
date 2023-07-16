import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {ResiSBT} from '../typechain-types'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

export const tasks = () => {
  task('set-default-role-uri', 'Set Default Role URI')
    .addParam('role', 'Role')
    .addParam('uri', 'role uri')
    .setAction(async ({role, uri}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiSBT: ResiSBT = await ethers.getContract('ResiSBT')
      const response = await ResiSBT.connect(admin).setDefaultRoleUri(keccak256(toUtf8Bytes(role)), uri)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('mint-sbt', 'Mint SBT')
    .addParam('to', 'Address to receive SBT')
    .addParam('role', 'User role')
    .addParam('uri', 'sbt uri')
    .setAction(async ({to, role, uri}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiSBT: ResiSBT = await ethers.getContract('ResiSBT')
      const response = await ResiSBT.connect(admin).mint(to, role, uri)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })
}
