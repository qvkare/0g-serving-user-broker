import { ServingContract } from '../contract';
import { Cache, Metadata } from '../storage';
import { ZGServingUserBrokerBase } from './base';
/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export declare class ResponseProcessor extends ZGServingUserBrokerBase {
    private verifier;
    constructor(contract: ServingContract, metadata: Metadata, cache: Cache);
    processResponse(providerAddress: string, svcName: string, content: string, chatID?: string): Promise<boolean | null>;
    private calculateOutputFees;
}
//# sourceMappingURL=response.d.ts.map