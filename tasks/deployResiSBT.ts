import {task, types} from 'hardhat/config'
import chalk from 'chalk'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {BigNumber, Contract, ContractFactory} from 'ethers'

export const tasks = () => {
  task('deploy-sbt', 'Deploy Resi SBT')
    .addParam('name', 'SBT name')
    .addParam('symbol', 'SBT symbol')
    .addParam('contractUri', 'Contract URI')
    .addParam('serieId', 'Serie ID')
    .addParam('registry', 'Registry address')
    .addParam('token', 'ResiToken address')
    .setAction(async ({name, symbol, contractUri, serieID, registry, token}, {ethers}) => {
      // const [admin]: SignerWithAddress[] = await ethers.getSigners()

      console.log(chalk.yellow('Deploying RESI SBT....'))

      const ResiSBTFactory: ContractFactory = await ethers.getContractFactory('ResiSBT')
      const ResiSBT: Contract = await ResiSBTFactory.deploy()
      await ResiSBT.deployed()

      console.log(chalk.green('Contract deployed to: ', ResiSBT.address))

      // INITIALIZATION
      console.log(chalk.yellow('Initializing ResiSBT'))

      const resiSBT: Contract = await ethers.getContractAt('ResiSBT', ResiSBT.address)
      await resiSBT.initialize(name, symbol, contractUri, serieID, registry, token)

      console.log(chalk.green('ResiSBT initialized'))
    })
}
