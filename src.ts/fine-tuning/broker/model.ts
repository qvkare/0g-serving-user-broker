import { BrokerBase } from './base'

export class ModelProcessor extends BrokerBase {
    async uploadDataset(privateKey: string, dataPath: string): Promise<string> {
        return this.zgClient.upload(privateKey, dataPath)
    }

    async acknowledgeModel(
        providerAddress: string,
        dataPath: string
    ): Promise<void> {
        try {
            const account = await this.contract.getAccount(providerAddress)
            const latestDeliverable = account.deliverables[-1]

            if (!latestDeliverable) {
                throw new Error('No deliverable found')
            }

            await this.zgClient.download(
                dataPath,
                latestDeliverable.modelRootHash
            )

            await this.contract.acknowledgeDeliverable(
                providerAddress,
                account.deliverables.length - 1
            )
        } catch (error) {
            throw error
        }
    }

    // 10. decrypt model
    //     1. [`call contract`] get deliverable with encryptedSecret
    //     2. decrypt the encryptedSecret
    //     3. decrypt model with secret [TODO: Discuss LiuYuan]
    async decryptModel(): Promise<void> {
        return
    }
}
