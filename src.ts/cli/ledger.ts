import { ZG_RPC_ENDPOINT_TESTNET } from './const'
import { neuronToA0gi, printTableWithTitle, withLedgerBroker } from './util'
import { Command } from 'commander'
import Table from 'cli-table3'
import { ZGComputeNetworkBroker } from '../sdk'
import chalk from 'chalk'

export default function ledger(program: Command) {
    program
        .command('get-account')
        .description('Retrieve account information')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
            withLedgerBroker(options, async (broker) => {
                getLedgerTable(broker)
            })
        })

    program
        .command('add-account')
        .description('Add account balance')
        .requiredOption('--amount <A0GI>', 'Amount to add')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
            withLedgerBroker(options, async (broker) => {
                console.log('Adding account...')
                await broker.ledger.addLedger(parseFloat(options.amount))
                console.log('Account Created!')
                getLedgerTable(broker)
            })
        })

    program
        .command('deposit')
        .description('Deposit funds into the account')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--amount <A0GI>', 'Amount of funds to deposit')
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
            withLedgerBroker(options, async (broker) => {
                console.log('Depositing...')
                await broker.ledger.depositFund(parseFloat(options.amount))
                console.log('Deposited funds:', options.amount, 'A0GI')
            })
        })

    program
        .command('refund')
        .description('Refund an amount from the account')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('-a, --amount <A0GI>', 'Amount to refund')
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
            withLedgerBroker(options, async (broker) => {
                console.log('Refunding...')
                await broker.ledger.refund(parseFloat(options.amount))
                console.log('Refunded amount:', options.amount, 'A0GI')
            })
        })
}

export const getLedgerTable = async (broker: ZGComputeNetworkBroker) => {
    // Ledger information
    const { ledgerInfo, infers, fines } = await broker.ledger.getLedger()

    let table = new Table({
        head: [chalk.blue('Balance'), chalk.blue('Value (A0GI)')],
        colWidths: [50, 81],
    })

    table.push(['Total', neuronToA0gi(ledgerInfo[0]).toFixed(18)])
    table.push([
        'Locked (transferred to sub-accounts)',
        neuronToA0gi(ledgerInfo[1]).toFixed(18),
    ])
    printTableWithTitle('Overview', table)
    // Inference information
    if (infers && infers.length !== 0) {
        let table = new Table({
            head: [
                chalk.blue('Provider'),
                chalk.blue('Balance (A0GI)'),
                chalk.blue('Requested Return to Main Account (A0GI)'),
            ],
            colWidths: [50, 30, 50],
        })
        for (const infer of infers) {
            table.push([
                infer[0],
                neuronToA0gi(infer[1]).toFixed(18),
                neuronToA0gi(infer[2]).toFixed(18),
            ])
        }

        printTableWithTitle(
            'Inference sub-accounts (Dynamically Created per Used Provider)',
            table
        )
    }

    // Fine tuning information
    if (fines && fines.length !== 0) {
        let table = new Table({
            head: [
                chalk.blue('Provider'),
                chalk.blue('Balance (A0GI)'),
                chalk.blue('Requested Return to Main Account (A0GI)'),
            ],
            colWidths: [50, 30, 50],
        })
        for (const fine of fines) {
            table.push([
                fine[0],
                neuronToA0gi(fine[1]).toFixed(18),
                neuronToA0gi(fine[2]).toFixed(18),
            ])
        }

        printTableWithTitle(
            'Fine-tuning sub-accounts (Dynamically Created per Used Provider)',
            table
        )
    }
}
