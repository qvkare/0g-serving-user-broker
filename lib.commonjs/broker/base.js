"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZGServingUserBrokerBase = void 0;
const storage_1 = require("../storage");
const extractor_1 = require("../extractor");
class ZGServingUserBrokerBase {
    contract;
    metadata;
    cache;
    constructor(contract, metadata, cache) {
        this.contract = contract;
        this.metadata = metadata;
        this.cache = cache;
    }
    async getProviderData(providerAddress) {
        const key = `${this.contract.getUserAddress()}_${providerAddress}`;
        const [nonce, outputFee, settleSignerPrivateKey] = await Promise.all([
            this.metadata.getNonce(key),
            this.metadata.getOutputFee(key),
            this.metadata.getSettleSignerPrivateKey(key),
        ]);
        return { nonce, outputFee, settleSignerPrivateKey };
    }
    async getService(providerAddress, svcName, useCache = true) {
        const key = providerAddress + svcName;
        const cachedSvc = await this.cache.getItem(key);
        if (cachedSvc && useCache) {
            return cachedSvc;
        }
        try {
            const svc = await this.contract.getService(providerAddress, svcName);
            await this.cache.setItem(key, svc, 1 * 60 * 1000, storage_1.CacheValueTypeEnum.Service);
            return svc;
        }
        catch (error) {
            throw error;
        }
    }
    async getExtractor(providerAddress, svcName, useCache = true) {
        try {
            const svc = await this.getService(providerAddress, svcName, useCache);
            const extractor = this.createExtractor(svc);
            return extractor;
        }
        catch (error) {
            throw error;
        }
    }
    createExtractor(svc) {
        switch (svc.serviceType) {
            case 'chatbot':
                return new extractor_1.ChatBot(svc);
            default:
                throw new Error('Unknown service type');
        }
    }
}
exports.ZGServingUserBrokerBase = ZGServingUserBrokerBase;
//# sourceMappingURL=base.js.map