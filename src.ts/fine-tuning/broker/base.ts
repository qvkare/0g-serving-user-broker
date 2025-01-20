import { FineTuningServingContract } from '../contract'
import { LedgerBroker } from '../../ledger'
import { ZGStorage } from '../zg-storage/zg-storage'
import { Provider } from '../provider/provider'

export abstract class BrokerBase {
    protected contract: FineTuningServingContract
    protected ledger: LedgerBroker
    protected zgClient: ZGStorage
    protected servingProvider: Provider

    constructor(contract: FineTuningServingContract, ledger: LedgerBroker, zgClient: ZGStorage, servingProvider: Provider) {
        this.contract = contract
        this.ledger = ledger
        this.zgClient = zgClient
        this.servingProvider = servingProvider
    }
}
