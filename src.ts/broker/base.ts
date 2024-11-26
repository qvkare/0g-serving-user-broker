import { ServingContract } from '../contract'
import { Cache, CacheValueTypeEnum, Metadata } from '../storage'
import { ChatBot, Extractor } from '../extractor'
import { ServiceStructOutput } from '../contract/serving/Serving'
import { ServingRequestHeaders } from './request'
import { decryptData, getNonce, strToPrivateKey } from '../utils'
import { PackedPrivkey, Request, signData } from '../settle-signer'

export abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract
    protected metadata: Metadata
    protected cache: Cache

    constructor(contract: ServingContract, metadata: Metadata, cache: Cache) {
        this.contract = contract
        this.metadata = metadata
        this.cache = cache
    }

    protected async getProviderData(providerAddress: string) {
        const key = `${this.contract.getUserAddress()}_${providerAddress}`
        const [settleSignerPrivateKey] = await Promise.all([
            this.metadata.getSettleSignerPrivateKey(key),
        ])
        return { settleSignerPrivateKey }
    }

    protected async getService(
        providerAddress: string,
        svcName: string,
        useCache = true
    ): Promise<ServiceStructOutput> {
        const key = providerAddress + svcName
        const cachedSvc = await this.cache.getItem(key)
        if (cachedSvc && useCache) {
            return cachedSvc
        }

        try {
            const svc = await this.contract.getService(providerAddress, svcName)
            await this.cache.setItem(
                key,
                svc,
                1 * 60 * 1000,
                CacheValueTypeEnum.Service
            )
            return svc
        } catch (error) {
            throw error
        }
    }

    protected async getExtractor(
        providerAddress: string,
        svcName: string,
        useCache = true
    ): Promise<Extractor> {
        try {
            const svc = await this.getService(
                providerAddress,
                svcName,
                useCache
            )
            const extractor = this.createExtractor(svc)
            return extractor
        } catch (error) {
            throw error
        }
    }

    protected createExtractor(svc: ServiceStructOutput): Extractor {
        switch (svc.serviceType) {
            case 'chatbot':
                return new ChatBot(svc)
            default:
                throw new Error('Unknown service type')
        }
    }

    async getHeader(
        providerAddress: string,
        svcName: string,
        content: string,
        outputFee: number
    ): Promise<ServingRequestHeaders> {
        try {
            const extractor = await this.getExtractor(providerAddress, svcName)
            const { settleSignerPrivateKey } = await this.getProviderData(
                providerAddress
            )
            const key = `${this.contract.getUserAddress()}_${providerAddress}`

            let privateKey = settleSignerPrivateKey
            if (!privateKey) {
                const account = await this.contract.getAccount(providerAddress)
                const privateKeyStr = await decryptData(
                    this.contract.signer,
                    account.additionalInfo
                )
                privateKey = strToPrivateKey(privateKeyStr)
                this.metadata.storeSettleSignerPrivateKey(key, privateKey)
            }

            const nonce = getNonce()

            const inputFee = await this.calculateInputFees(extractor, content)
            const fee = inputFee + outputFee

            const request = new Request(
                nonce.toString(),
                fee.toString(),
                this.contract.getUserAddress(),
                providerAddress
            )
            const settleSignature = await signData(
                [request],
                privateKey as PackedPrivkey
            )
            const sig = JSON.stringify(Array.from(settleSignature[0]))

            return {
                'X-Phala-Signature-Type': 'StandaloneApi',
                Address: this.contract.getUserAddress(),
                Fee: fee.toString(),
                'Input-Fee': inputFee.toString(),
                Nonce: nonce.toString(),
                'Previous-Output-Fee': outputFee.toString(),
                'Service-Name': svcName,
                Signature: sig,
            }
        } catch (error) {
            throw error
        }
    }

    private async calculateInputFees(extractor: Extractor, content: string) {
        const svc = await extractor.getSvcInfo()
        const inputCount = await extractor.getInputCount(content)
        const inputFee = inputCount * Number(svc.inputPrice)
        return inputFee
    }
}
