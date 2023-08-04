import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {ResiToken} from '../typechain-types'
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils'

export const tasks = () => {
  task('add-mentor', 'Add mentor')
    .addParam('mentor', 'Mentor address')
    .addParam('serieId', 'Serie')
    .addParam('project', 'Project name')
    .setAction(async ({mentor, serieId, project}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).addMentor(
        mentor,
        serieId,
        ethers.utils.formatBytes32String(project)
      )
      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('add-project-builder', 'Add project builder')
    .addParam('builder', 'Builder address')
    .addParam('serieId', 'Serie')
    .addParam('project', 'Project name')
    .setAction(async ({builder, serieId, project}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).addProjectBuilder(
        builder,
        serieId,
        ethers.utils.formatBytes32String(project)
      )
      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('add-resi-builder', 'Add resi builder')
    .addParam('builder', 'Builder address')
    .setAction(async ({builder}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).addResiBuilder(builder)
      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('add-roles', 'Add roles batch')
    .addParam('role', 'Role name')
    .addParam('users', 'Users to add separated by ')
    .setAction(async ({role, users}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const _users = users.split(',')
      const response = await ResiToken.connect(admin).addRolesBatch(keccak256(toUtf8Bytes(role)), _users)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('award', 'Award with ResiToken')
    .addParam('user', 'Address to award')
    .addParam('role', 'User role')
    .addParam('amount', 'Amount to award in wei')
    .setAction(async ({user, role, amount}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).award(user, keccak256(toUtf8Bytes(role)), amount)

      console.log(chalk.yellow(`Transaction hash: ${response.hash}`))
      const receipt = await response.wait()
      if (receipt.status !== 0) {
        console.log(chalk.green('Done!'))
      } else {
        console.log(chalk.red('Failed!'))
      }
    })

  task('get-balance', 'Get ResiToken balance')
    .addParam('user', 'Address to award')
    .setAction(async ({user, role, amount}, {ethers}) => {
      const [admin]: SignerWithAddress[] = await ethers.getSigners()
      const ResiToken: ResiToken = await ethers.getContract('ResiToken')
      const response = await ResiToken.connect(admin).balanceOf(user)

      console.log(response.toString())
    })
}
