#!/usr/bin/env ts-node

import { Command } from 'commander'
import { neuronToA0gi, withFineTuningBroker } from './util'
import { ZG_RPC_ENDPOINT_TESTNET } from './const'
import Table from 'cli-table3'
import chalk from 'chalk'

export default function (program: Command) {
    program
        .command('get-sub-account')
        .description('Retrieve sub account information')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--provider <address>', 'Provider address')
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option(
            '--ledger-ca <address>',
            'Main Account (ledger) contract address'
        )
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option(
            '--infer',
            'get sub-account for inference, default is fine-tuning'
        )
        .action((options: any) => {
            if (options.infer) {
                // withLedgerBroker(options, async (broker) => {
                //     const account = await broker.ledger.getInferenceAccount(
                //         options.provider
                //     )
                //     console.log(
                //         `Balance: ${account.balance.toString()}, Pending refund: ${account.pendingRefund.toString()}, Provider signer: ${
                //             account.providerSigner
                //         }`
                //     )
                // })
                return
            }
            withFineTuningBroker(options, async (broker) => {
                const account = await broker.fineTuning!.getAccount(
                    options.provider
                )

                let table = new Table({
                    head: [chalk.blue('Field'), chalk.blue('Value')],
                    colWidths: [50, 50],
                })
                table.push([
                    'Balance (A0GI)',
                    neuronToA0gi(account.balance).toFixed(18),
                ])
                table.push([
                    'Requested Return to Main Account (A0GI)',
                    neuronToA0gi(account.pendingRefund),
                ])

                console.log('\nOverview\n' + table.toString())

                table = new Table({
                    head: [
                        chalk.blue('Root Hash'),
                        chalk.blue('Access Confirmed'),
                    ],
                    colWidths: [75, 25],
                })

                account.deliverables.forEach((deliverable) => {
                    table.push([
                        deliverable.modelRootHash,
                        deliverable.acknowledged
                            ? chalk.greenBright.bold('\u2713')
                            : '',
                    ])
                })

                console.log('\nDeliverables\n' + table.toString())
            })
        })

    program
        .command('list-providers')
        .description('List fine-tuning providers')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option(
            '--ledger-ca <address>',
            'Main Account (ledger) contract address'
        )
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options: any) => {
            if (options.infer) {
                return
            }
            withFineTuningBroker(options, async (broker) => {
                const services = await broker.fineTuning!.listService()
                const table = new Table({
                    colWidths: [50, 50],
                })

                services.forEach((service, index) => {
                    table.push([
                        chalk.blue(`Provider ${index + 1}`),
                        chalk.blue(service.provider),
                    ])
                    let available = !service.occupied ? '\u2713' : `\u2717`

                    if (service.providerSigner) {
                    }
                    table.push(['Available', available])
                    table.push([
                        'Price Per Byte in Dataset (A0GI)',
                        neuronToA0gi(service.pricePerToken).toFixed(18),
                    ])
                    table.push(['URL', service.url])
                    // TODO: Show quota when backend ready
                    // table.push([
                    //     'Quota(CPU, Memory, GPU Count, Storage, CPU Type)',
                    //     service.quota.toString(),
                    // ])
                })
                console.log(table.toString())
            })
        })
}
