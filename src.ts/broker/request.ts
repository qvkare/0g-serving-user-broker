import { Extractor } from '../extractor'
import { Metadata } from '../storage'
import { sign } from '../zk'
import { ZGServingUserBrokerBase } from './base'
import { Request } from '0g-zk-settlement-client'
import { REQUEST_LENGTH } from './const'

/**
 * ServingRequestHeaders 包含请求计费相关的 headers。
 * 需要被添加到请求中。
 */
export interface ServingRequestHeaders {
    /**
     * 用户的地址
     */
    Address: string
    /**
     * 请求的总费用。等于 'Input-Fee' + 'Previous-Output-Fee'
     */
    Fee: string
    /**
     * 此次请求输入所需要的费用。例如，对于 chatbot 类型的服务，'Input-Fee' = 就是用户输入的 token 个数 * 单个 token 价格
     */
    'Input-Fee': string
    Nonce: string
    /**
     * 上一次请求返回的费用。由于 0G Serving 体系下，request 是唯一支付凭证，因此上一次请求返回的费用将会附带在当前的请求中。
     * 以 chatbot 类型的服务举例，'Previous-Output-Fee' = 上一轮 service 对用户输入的返回 token 个数 * 单个 token 价格
     */
    'Previous-Output-Fee': string
    /**
     * 服务名称
     */
    'Service-Name': string
    /**
     * 用户对其余 header 的签名。通过附加这个信息，用户给当前 request 赋予了结算凭证的特性。
     */
    Signature: string
}

/**
 * RequestProcessor 为 ZGServingUserBroker 的子类
 * 需要用 createZGServingUserBroker 初始化 ZGServingUserBroker
 * 后使用
 */
export class RequestProcessor extends ZGServingUserBrokerBase {
    /**
     * processRequest 在 user 使用 provider service 时，
     * 为请求生成计费相关的 headers。
     *
     * 0G Serving 体系下，具备合法计费 headers 的请求（request）被视作结算凭证，
     * 将被 provider 用于合约上结算。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @param content - 被计费的主体。例如，chatbot 类型的服务下就是用户输入的文字。
     * @returns headers。记录着请求的费用、用户签名等信息。
     */
    async processRequest(
        providerAddress: string,
        svcName: string,
        content: string
    ): Promise<ServingRequestHeaders> {
        const extractor = await this.getExtractor(providerAddress, svcName)

        const { nonce, outputFee, zkPrivateKey } = await this.getProviderData(
            providerAddress
        )

        if (!zkPrivateKey) {
            const error = new Error('Miss private key for signing request')
            console.error(error)
            throw error
        }

        const updatedNonce = !nonce ? 1 : nonce + REQUEST_LENGTH
        const key = this.contract.getUserAddress() + providerAddress
        Metadata.storeNonce(key, updatedNonce)

        const { fee, inputFee } = await this.calculateFees(
            extractor,
            content,
            outputFee
        )

        const zkInput = new Request(
            updatedNonce.toString(),
            fee.toString(),
            this.contract.getUserAddress(),
            providerAddress
        )

        const sig = await sign([zkInput], zkPrivateKey)

        return {
            Address: this.contract.getUserAddress(),
            Fee: zkInput.fee.toString(),
            'Input-Fee': inputFee.toString(),
            Nonce: zkInput.nonce.toString(),
            'Previous-Output-Fee': (outputFee ?? 0).toString(),
            'Service-Name': svcName,
            Signature: sig,
        }
    }

    private async calculateFees(
        extractor: Extractor,
        content: string,
        outputFee: number | null
    ) {
        const svc = await extractor.getSvcInfo()
        const inputCount = await extractor.getInputCount(content)
        const inputFee = inputCount * Number(svc.inputPrice)
        const fee = inputFee + (outputFee ?? 0)
        return { fee, inputFee }
    }
}
