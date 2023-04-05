import chalk from 'chalk'

export const printSuccess = (text: String): void => {
  console.log(chalk.green(text))
}

export const printError = (text: String): void => {
  console.log(chalk.red(text))
}

export const printInfo = (text: String): void => {
  console.log(chalk.yellow(text))
}

export const printDeploySuccessful = (contractName: String, address: String) => {
  printInfo('\n Contract Deployment Complete!\n')
  printSuccess(`  ContractName ${contractName}\n`)
  printSuccess(`  ContractAddress - ${address}`)
}
