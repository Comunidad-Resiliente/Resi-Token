import {ethers, run} from 'hardhat'
import {Network} from 'hardhat/types'
import {Deployment} from 'hardhat-deploy/dist/types'
import {printInfo, printError} from '../utils'

export type TaskArgs = {
  address: string
  constructorArguments?: string[]
}

export const verifier = async (
  network: Network,
  deployResult: Deployment,
  contractName: string,
  constructorArguments?: string[]
) => {
  if (network.live && deployResult.transactionHash) {
    const blocks = 5
    const address = deployResult.implementation || deployResult.address
    const taskArgs: TaskArgs = {address}
    if (constructorArguments) taskArgs.constructorArguments = constructorArguments

    printInfo(`Waiting ${blocks} blocks before verifying`)
    await ethers.provider.waitForTransaction(deployResult.transactionHash, blocks)
    try {
      printInfo(`Starting Verification of ${contractName} ${address}`)
      await run('verify:verify', taskArgs)
    } catch (err: any) {
      if (err.message.includes('Already Verified')) {
        printError('Already Verified')
        return
      }
      throw err
    }
  }
}
