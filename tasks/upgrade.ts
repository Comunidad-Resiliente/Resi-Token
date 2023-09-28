import {task, types} from 'hardhat/config'
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers'
import {printError, printInfo, printSuccess} from '../utils'

export const tasks = () => {
  task('upgrade', 'Upgrade a Proxy to a new impementation')
    .addParam('implementation', 'New Implementation address')
    .addParam('proxy', 'Proxy address we are upgrading')
    .addOptionalParam('data', 'Method data to call on new implementation', undefined, types.string)
    .setAction(async ({implementation, proxy, data}, {deployments, ethers}) => {
      const {get} = deployments
      const [adminMember]: SignerWithAddress[] = await ethers.getSigners()
      // Get the contracts
      const proxyAdminAddress = (await get('ResiProxyAdmin')).address
      const resiProxyAdmin = (await ethers.getContractFactory('ResiProxyAdmin', adminMember)).attach(proxyAdminAddress)

      let tx = undefined
      if (data) {
        tx = await resiProxyAdmin.upgradeAndCall(proxy, implementation, data)
      } else {
        tx = await resiProxyAdmin.upgrade(proxy, implementation)
      }
      printInfo(`Transaction sent ${tx.hash} to upgrade proxy ${proxy} to ${implementation}`)
      const receipt = await tx.wait()
      if (receipt.status !== 0) {
        printSuccess('Done!')
      } else {
        printError('Failed!')
      }
    })
}
